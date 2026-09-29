# Ad-hoc accuracy check against a held-out sample of TrashNet images
# (see MODEL_EVALUATION.md for how/why this was used and what it found).
# Download the dataset first — see scripts/train_model.py's header comment.

import os
import random
import sys
from collections import defaultdict

import numpy as np
from PIL import Image
import tf_keras
from tf_keras.applications.mobilenet_v2 import preprocess_input

MODEL_PATH = os.environ.get("MODEL_PATH", "/Users/amankumar/Desktop/Dev/scrappy-main/model/keras_model.h5")
DATASET_DIR = os.environ.get("TRASHNET_DIR", "/tmp/trashnet_eval/dataset-resized")
CLASS_NAMES = ["Cardboard", "Glass", "Metal", "Paper", "Plastic", "Trash"]

# map TrashNet folder name -> our model's class label
FOLDER_TO_LABEL = {
    "cardboard": "Cardboard",
    "glass": "Glass",
    "metal": "Metal",
    "paper": "Paper",
    "plastic": "Plastic",
    "trash": "Trash",
}

SAMPLES_PER_CLASS = 40
random.seed(42)

print("Loading model...")
model = tf_keras.models.load_model(MODEL_PATH, compile=False)
input_shape = model.input_shape[1:3]
print("Input shape:", input_shape)

def predict(image_path):
    img = Image.open(image_path).convert("RGB").resize(input_shape)
    arr = np.expand_dims(preprocess_input(np.array(img, dtype=np.float32)), axis=0)
    preds = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(preds))
    return CLASS_NAMES[idx], float(preds[idx])

total = 0
correct = 0
per_class_total = defaultdict(int)
per_class_correct = defaultdict(int)
confusion = defaultdict(lambda: defaultdict(int))  # true -> predicted -> count

for folder, true_label in FOLDER_TO_LABEL.items():
    folder_path = os.path.join(DATASET_DIR, folder)
    files = [f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    random.shuffle(files)
    sample = files[:SAMPLES_PER_CLASS]

    for fname in sample:
        pred_label, confidence = predict(os.path.join(folder_path, fname))
        total += 1
        per_class_total[true_label] += 1
        confusion[true_label][pred_label] += 1
        if pred_label == true_label:
            correct += 1
            per_class_correct[true_label] += 1

    print(f"  {folder} ({true_label}): {len(sample)} images evaluated")

print()
print(f"OVERALL ACCURACY: {correct}/{total} = {100*correct/total:.1f}%")
print()
print("Per-class accuracy:")
for label in FOLDER_TO_LABEL.values():
    t = per_class_total[label]
    c = per_class_correct[label]
    print(f"  {label:10s}: {c}/{t} = {100*c/t:.1f}%")

print()
print("Confusion matrix (rows=true, cols=predicted):")
all_labels = sorted(set(FOLDER_TO_LABEL.values()) | {l for d in confusion.values() for l in d})
header = "true\\pred".ljust(12) + "".join(l[:6].ljust(8) for l in all_labels)
print(header)
for true_label in FOLDER_TO_LABEL.values():
    row = true_label.ljust(12)
    for pred_label in all_labels:
        row += str(confusion[true_label].get(pred_label, 0)).ljust(8)
    print(row)
