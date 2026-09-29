# Waste-classification model: full training, testing & validation record

This documents the entire process — why we retrained, what data we used, exactly how the model was trained, and how it was validated — so the result is reproducible and the numbers are traceable, not just asserted.

## 1. Background — why this happened

The original `keras_model.h5` was a [Google Teachable Machine](https://teachablemachine.withgoogle.com/) export with 7 classes: `Glass, Metal, Paper, Plastic, Battery, Biological, Trash`. It had **never been benchmarked against any labeled test data** — it shipped in the app on faith alone.

## 2. Testing the original model

There was no test dataset anywhere in the project. We downloaded [TrashNet](https://github.com/garythung/trashnet) — 2,527 real photos across `cardboard, glass, metal, paper, plastic, trash` — as an external set the model had never seen.

5 of TrashNet's 6 categories overlap with the original model's classes. `Battery` and `Biological` have **no equivalent in TrashNet at all**, so they couldn't be tested — itself a red flag, since it means those two classes may never have had real training data behind them.

**Method:** `scripts/evaluate_model.py` — 40 randomly sampled images per overlapping class (200 total), each run through the model, prediction compared against the known folder label.

**Result: 40% overall accuracy**, and not evenly bad — systematically biased toward two answers:

| Class | Accuracy | Sample size |
|---|---|---|
| Plastic | 92.5% | 37/40 |
| Paper | 55.0% | 22/40 |
| Trash | 25.0% | 10/40 |
| Glass | 15.0% | 6/40 |
| Metal | 12.5% | 5/40 |

Confusion matrix (rows = true label, columns = predicted):

| true \ pred | Battery | Biological | Glass | Metal | Paper | Plastic | Trash |
|---|---|---|---|---|---|---|---|
| Glass | 17 | 0 | 6 | 0 | 0 | 17 | 0 |
| Metal | 12 | 5 | 1 | 5 | 0 | 17 | 0 |
| Paper | 5 | 0 | 0 | 0 | 22 | 13 | 0 |
| Plastic | 2 | 0 | 1 | 0 | 0 | 37 | 0 |
| Trash | 3 | 3 | 0 | 0 | 2 | 22 | 10 |

The model defaulted to **"Plastic"** or **"Battery"** for most inputs regardless of what was actually pictured. Plastic's 92.5% wasn't the model being good at plastic — it was guessing "Plastic" so often that it happened to be right whenever the answer *was* plastic, cannibalizing every other class in the process.

**Caveat on interpretation:** this measures cross-domain generalization (TrashNet's studio-lit, white-background photos vs. whatever the original model was actually trained on — undocumented and unknown). It isn't necessarily "the model is 40% accurate" in an absolute sense, but it's a strong, concrete signal that the model didn't generalize robustly.

## 3. Decision: retrain on real, verifiable data

TrashNet has no `Battery` or `Biological` categories, and no ready dataset existed for either. Rather than keep two categories with zero verifiable training signal, we retrained on the 6 classes we actually have real photographic data for: **Cardboard, Glass, Metal, Paper, Plastic, Trash**.

## 4. Dataset preparation

Source: TrashNet `dataset-resized.zip` (2,527 JPGs, pre-resized to a consistent size).

Split **per class**, stratified 70% train / 15% validation / 15% test (`random.seed(42)` for reproducibility):

| Class | Total | Train | Val | Test |
|---|---|---|---|---|
| Cardboard | 403 | 282 | 60 | 61 |
| Glass | 501 | 350 | 75 | 76 |
| Metal | 410 | 287 | 61 | 62 |
| Paper | 594 | 415 | 89 | 90 |
| Plastic | 482 | 337 | 72 | 73 |
| Trash | 137 | 95 | 20 | 22 |
| **Total** | **2,527** | **1,766** | **377** | **384** |

`Trash` is the clear weak point in the source data itself — under a third the size of the next-smallest class.

Training-set-only augmentation (val/test stay unaugmented, to measure real performance): rotation ±25°, width/height shift ±15%, shear ±10%, zoom ±20%, horizontal flip, brightness jitter 0.8–1.2×.

## 5. Model architecture

Transfer learning on **MobileNetV2** (ImageNet-pretrained, `include_top=False`, input `224×224×3`):

```
MobileNetV2 base (frozen in Phase 1)
  → GlobalAveragePooling2D
  → Dropout(0.3)
  → Dense(128, relu)
  → Dropout(0.3)
  → Dense(6, softmax)
```

## 6. Training — two phases

**Phase 1 — train the new head, base frozen.** Adam, lr=1e-3, categorical cross-entropy, batch size 32, up to 15 epochs, early stopping on `val_accuracy` (patience=4, restore best weights). Stopped after 11 epochs:

| Epoch | train_acc | val_acc | val_loss |
|---|---|---|---|
| 1 | 0.558 | 0.748 | 0.689 |
| 2 | 0.712 | 0.796 | 0.563 |
| 3 | 0.776 | 0.796 | 0.537 |
| 4 | 0.792 | 0.841 | 0.477 |
| 5 | 0.795 | 0.828 | 0.484 |
| 6 | 0.802 | 0.833 | 0.496 |
| 7 | 0.841 | 0.852 | 0.449 |
| 8 | 0.845 | 0.828 | 0.448 |
| 9 | 0.853 | 0.841 | 0.454 |
| 10 | 0.858 | 0.833 | 0.452 |
| 11 | 0.866 | 0.841 | 0.459 |

**Phase 2 — fine-tune.** Unfroze the top 30 layers of MobileNetV2, dropped learning rate to 1e-5 (small, to avoid destroying the pretrained features), same early-stopping setup. Stopped after 11 epochs:

| Epoch | train_acc | val_acc | val_loss |
|---|---|---|---|
| 1 | 0.710 | 0.854 | 0.433 |
| 2 | 0.774 | 0.852 | 0.429 |
| 3 | 0.800 | 0.857 | 0.428 |
| 4 | 0.802 | 0.865 | 0.423 |
| 5 | 0.826 | 0.867 | 0.424 |
| 6 | 0.830 | 0.867 | 0.419 |
| 7 | 0.826 | **0.870** | 0.413 |
| 8 | 0.834 | 0.867 | 0.414 |
| 9 | 0.844 | 0.867 | 0.412 |
| 10 | 0.865 | 0.862 | 0.416 |
| 11 | 0.856 | 0.867 | 0.415 |

Best validation accuracy (epoch 7) restored before saving. Total training time: ~13 minutes, CPU-only (Apple Silicon).

## 7. Final validation — held-out test set

The test split (384 images) was **never touched** during training or validation — used exactly once, at the end, for this number:

**Test accuracy: 85.2%** (loss 0.390)

| Class | Accuracy | Correct/Total |
|---|---|---|
| Cardboard | 93.4% | 57/61 |
| Metal | 91.9% | 57/62 |
| Paper | 88.9% | 80/90 |
| Plastic | 83.6% | 61/73 |
| Glass | 82.9% | 63/76 |
| Trash | 40.9% | 9/22 |

Confusion matrix (rows = true, columns = predicted):

| true \ pred | Cardboard | Glass | Metal | Paper | Plastic | Trash |
|---|---|---|---|---|---|---|
| Cardboard | 57 | 0 | 0 | 2 | 1 | 1 |
| Glass | 0 | 63 | 5 | 1 | 6 | 1 |
| Metal | 0 | 4 | 57 | 0 | 1 | 0 |
| Paper | 5 | 0 | 2 | 80 | 1 | 2 |
| Plastic | 0 | 5 | 2 | 2 | 61 | 3 |
| Trash | 0 | 2 | 6 | 2 | 3 | 9 |

Unlike the old model, this confusion matrix is properly diagonal — no single class is being over-predicted at the expense of the rest. `Trash` is the one real weak point: it's an inherently ambiguous catch-all category (visually overlaps with contaminated paper/metal/plastic) and had the least training data by a wide margin (137 total images vs. 400+ for most other classes). Its errors spread across multiple classes rather than collapsing into one — a real classifier making genuine mistakes on a hard class, not a broken one.

## 8. Wiring it into the app

- `model/keras_model.h5` replaced with the newly trained model
- `model/labels.txt` updated to the 6 new classes, in the model's actual output order
- `model/app.py`: `class_names` updated; **preprocessing changed** from the old model's simple `/255.0` normalization to MobileNetV2's `preprocess_input` (scales to `[-1, 1]`) — using the wrong preprocessing for a MobileNetV2 model silently produces garbage predictions, so this had to change in lockstep with the model file
- Sanity-tested via `app.py`'s actual `detect_objects_on_image()` function (not just the training script) on fresh sample images from 4 different classes — all correct
- Client updated to match: `ScannerBtn.jsx` (category list + point values), `Profile.jsx` (scan-history icons)

## 9. Reproducing this

```bash
# 1. Get the dataset
curl -L -o dataset.zip https://raw.githubusercontent.com/garythung/trashnet/master/data/dataset-resized.zip
unzip dataset.zip

# 2. Install training-only dependency (on top of requirements.txt)
cd model && ./venv/bin/pip install scipy

# 3. Train (point at wherever you extracted the dataset)
TRASHNET_DIR=/path/to/dataset-resized ./venv/bin/python scripts/train_model.py

# 4. Evaluate any model against a fresh TrashNet sample
MODEL_PATH=./keras_model.h5 TRASHNET_DIR=/path/to/dataset-resized ./venv/bin/python scripts/evaluate_model.py
```

## Files

- `scripts/train_model.py` — retraining script
- `scripts/evaluate_model.py` — accuracy-check script (update `CLASS_NAMES`/`FOLDER_TO_LABEL` if the class list changes again)
- `keras_model.h5` — the trained model file used by `app.py`
- `labels.txt` — class list matching the model's output order
