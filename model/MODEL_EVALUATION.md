# Waste-classification model: evaluation & retraining

## Background

The original `keras_model.h5` was a [Google Teachable Machine](https://teachablemachine.withgoogle.com/) export with 7 classes: `Glass, Metal, Paper, Plastic, Battery, Biological, Trash`. It had never been benchmarked against any labeled test data — it was just assumed to work.

## Step 1: Measuring the original model's real accuracy

There was no test dataset anywhere in the project. We downloaded [TrashNet](https://github.com/garythung/trashnet) (2,527 images, categories: `cardboard, glass, metal, paper, plastic, trash`) as an external, never-seen-by-the-model test set.

5 of TrashNet's 6 categories overlap with the original model's classes (`Battery` and `Biological` have no equivalent in TrashNet, so they couldn't be tested at all — a red flag on their own, since it means those two classes may never have had solid training data in the first place).

**Method:** `scripts/evaluate_model.py` — 40 random images per overlapping class (200 total), run through the model, predictions compared against the known ground-truth folder label.

**Result: 40% overall accuracy**, and not evenly bad — systematically biased:

| Class | Accuracy |
|---|---|
| Plastic | 92.5% (37/40) |
| Paper | 55.0% (22/40) |
| Trash | 25.0% (10/40) |
| Glass | 15.0% (6/40) |
| Metal | 12.5% (5/40) |

The confusion matrix showed the model defaulting to **"Plastic"** or **"Battery"** for most inputs regardless of what was actually pictured — e.g. Glass was predicted "Battery" 17 times and "Plastic" 17 times out of 40, correct only 6 times. Plastic's high score wasn't the model being good at plastic; it was the model guessing "Plastic" so often that it happened to be right whenever the answer *was* plastic, while cannibalizing every other class.

**Caveat:** this tests cross-domain generalization (TrashNet's studio-lit white-background photos vs. whatever the original model was trained on, which is unknown/undocumented). It's not necessarily "the model is 40% accurate" in an absolute sense, but it's a meaningful signal that the model doesn't generalize robustly.

## Step 2: Decision — retrain on real, verifiable data

TrashNet has no `Battery` or `Biological` categories, and there was no ready dataset for those either. Rather than keep two categories with no verifiable training signal, we retrained on the 6 classes we actually have real data for: `Cardboard, Glass, Metal, Paper, Plastic, Trash`.

## Step 3: Retraining

**Method:** `scripts/train_model.py` — transfer learning on **MobileNetV2** (ImageNet-pretrained):

1. Stratified 70/15/15 train/val/test split per class (avoids class imbalance leaking into the split)
2. Data augmentation on the training set only (rotation, shift, shear, zoom, horizontal flip, brightness jitter) — needed since the smallest class (`trash`) has only ~137 images total
3. **Phase 1:** MobileNetV2 base frozen, train a new classification head (`GlobalAveragePooling → Dropout → Dense(128) → Dropout → Dense(6, softmax)`) for up to 15 epochs with early stopping on validation accuracy
4. **Phase 2:** unfreeze the top 30 layers of MobileNetV2, fine-tune the whole thing at a much lower learning rate (1e-5) for up to 15 more epochs, again with early stopping
5. Final evaluation on the **held-out test split** (never seen during training or validation)

## Result

**Test accuracy: 85.2%** on the held-out test split (never seen during training or validation) — up from 40% and with the earlier bias problem gone (no single class dominating predictions).

| Class | Accuracy |
|---|---|
| Cardboard | 93.4% (57/61) |
| Metal | 91.9% (57/62) |
| Paper | 88.9% (80/90) |
| Glass | 82.9% (63/76) |
| Plastic | 83.6% (61/73) |
| Trash | 40.9% (9/22) |

`Trash` remains the weak point — it's an inherently ambiguous catch-all category (a "trash" item can visually resemble contaminated paper, plastic, etc.) and had the fewest training images (only ~95 after the train/val/test split, vs. 280–415 for other classes). The confusion matrix shows it's mostly being confused with metal and plastic, not collapsing into one dominant wrong answer the way the old model did — a real classifier making genuine mistakes on a hard class, not a broken one.

Training log: 2 phases, 11 epochs (frozen base) + 11 epochs (fine-tuning, early-stopped), ~13 minutes total on CPU.

## Files

- `scripts/train_model.py` — retraining script (requires `scipy` in addition to `requirements.txt`, used only for augmentation)
- `scripts/evaluate_model.py` — the accuracy-check script used in Step 1, reusable for any future model by updating `CLASS_NAMES`/`FOLDER_TO_LABEL`
- `keras_model.h5` — the trained model file used by `app.py`
- `labels.txt` — class list matching the model's output order
