# Retrains the waste-classification model via transfer learning on MobileNetV2.
#
# Dataset: TrashNet (garythung/trashnet), downloaded from:
#   https://raw.githubusercontent.com/garythung/trashnet/master/data/dataset-resized.zip
# Unzip it so SRC_DIR below points at the extracted "dataset-resized" folder
# (six subfolders: cardboard, glass, metal, paper, plastic, trash).
#
# Run from the model/ directory with its venv:
#   ./venv/bin/python scripts/train_model.py

import os
import random
import shutil

import numpy as np
import tf_keras
from tf_keras.preprocessing.image import ImageDataGenerator
from tf_keras.applications import MobileNetV2
from tf_keras.applications.mobilenet_v2 import preprocess_input
from tf_keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tf_keras.models import Model
from tf_keras.optimizers import Adam
from tf_keras.callbacks import EarlyStopping

random.seed(42)
np.random.seed(42)

SRC_DIR = os.environ.get("TRASHNET_DIR", "/tmp/trashnet_eval/dataset-resized")
SPLIT_DIR = "/tmp/trashnet_eval/split"
CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]
IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# --- 1. stratified train/val/test split (70/15/15) ---
if os.path.exists(SPLIT_DIR):
    shutil.rmtree(SPLIT_DIR)

for split in ["train", "val", "test"]:
    for cls in CLASSES:
        os.makedirs(os.path.join(SPLIT_DIR, split, cls), exist_ok=True)

for cls in CLASSES:
    files = os.listdir(os.path.join(SRC_DIR, cls))
    files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    random.shuffle(files)

    n = len(files)
    n_train = int(n * 0.70)
    n_val = int(n * 0.15)

    splits = {
        "train": files[:n_train],
        "val": files[n_train:n_train + n_val],
        "test": files[n_train + n_val:],
    }

    for split, split_files in splits.items():
        for f in split_files:
            shutil.copy(
                os.path.join(SRC_DIR, cls, f),
                os.path.join(SPLIT_DIR, split, cls, f),
            )

    print(f"{cls}: train={len(splits['train'])} val={len(splits['val'])} test={len(splits['test'])}")

# --- 2. data generators ---
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=25,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.1,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=(0.8, 1.2),
)
val_test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

train_gen = train_datagen.flow_from_directory(
    os.path.join(SPLIT_DIR, "train"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    classes=CLASSES,
    shuffle=True,
    seed=42,
)
val_gen = val_test_datagen.flow_from_directory(
    os.path.join(SPLIT_DIR, "val"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    classes=CLASSES,
    shuffle=False,
)
test_gen = val_test_datagen.flow_from_directory(
    os.path.join(SPLIT_DIR, "test"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    classes=CLASSES,
    shuffle=False,
)

print("Class indices:", train_gen.class_indices)

# --- 3. build model: MobileNetV2 transfer learning ---
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)
predictions = Dense(len(CLASSES), activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(learning_rate=1e-3), loss="categorical_crossentropy", metrics=["accuracy"])

print("\n=== Phase 1: training classification head (base frozen) ===")
early_stop = EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True)
model.fit(train_gen, validation_data=val_gen, epochs=15, callbacks=[early_stop], verbose=2)

# --- 4. fine-tune: unfreeze last ~30 layers of the base ---
print("\n=== Phase 2: fine-tuning top layers of MobileNetV2 ===")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(optimizer=Adam(learning_rate=1e-5), loss="categorical_crossentropy", metrics=["accuracy"])
early_stop2 = EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True)
model.fit(train_gen, validation_data=val_gen, epochs=15, callbacks=[early_stop2], verbose=2)

# --- 5. evaluate on held-out test set ---
print("\n=== Final evaluation on held-out test set ===")
test_loss, test_acc = model.evaluate(test_gen, verbose=0)
print(f"TEST ACCURACY: {test_acc*100:.1f}%  (loss={test_loss:.3f})")

# confusion matrix
test_gen.reset()
preds = model.predict(test_gen, verbose=0)
pred_labels = np.argmax(preds, axis=1)
true_labels = test_gen.classes

from collections import defaultdict
confusion = defaultdict(lambda: defaultdict(int))
for t, p in zip(true_labels, pred_labels):
    confusion[CLASSES[t]][CLASSES[p]] += 1

print("\nConfusion matrix (rows=true, cols=predicted):")
header = "true\\pred".ljust(12) + "".join(c[:6].ljust(8) for c in CLASSES)
print(header)
for true_cls in CLASSES:
    row = true_cls.ljust(12)
    for pred_cls in CLASSES:
        row += str(confusion[true_cls].get(pred_cls, 0)).ljust(8)
    print(row)

per_class_acc = {}
for cls in CLASSES:
    total = sum(confusion[cls].values())
    correct = confusion[cls].get(cls, 0)
    per_class_acc[cls] = (correct, total)

print("\nPer-class accuracy:")
for cls, (correct, total) in per_class_acc.items():
    pct = 100 * correct / total if total else 0
    print(f"  {cls:10s}: {correct}/{total} = {pct:.1f}%")

# --- 6. save model ---
model.save("/tmp/trashnet_eval/new_keras_model.h5")
print("\nSaved to /tmp/trashnet_eval/new_keras_model.h5")
