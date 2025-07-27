import os
import cv2
from pathlib import Path
import shutil

def apply_clahe(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl1 = clahe.apply(gray)
    cl1_bgr = cv2.cvtColor(cl1, cv2.COLOR_GRAY2BGR)
    return cl1_bgr

def process_split(split):
    base_dir = Path("Dataset") / split
    input_img_dir = base_dir / "images"
    input_lbl_dir = base_dir / "labels"
    output_img_dir = base_dir / "processed_images"
    output_lbl_dir = base_dir / "processed_labels"

    output_img_dir.mkdir(exist_ok=True)
    output_lbl_dir.mkdir(exist_ok=True)

    for img_file in input_img_dir.iterdir():
        if img_file.suffix.lower() in [".jpg", ".jpeg", ".png"]:
            image = cv2.imread(str(img_file))
            if image is None:
                print(f"Warning: Failed to read {img_file}")
                continue

            processed_image = apply_clahe(image)
            out_img_path = output_img_dir / img_file.name
            cv2.imwrite(str(out_img_path), processed_image)

            # Copy corresponding label file
            label_file = input_lbl_dir / (img_file.stem + ".txt")
            if label_file.exists():
                shutil.copy(label_file, output_lbl_dir / label_file.name)
            else:
                print(f"Label not found for {img_file.name}, skipping label.")

    print(f"{split.capitalize()} preprocessing complete.\n"
          f"Images: {len(list(output_img_dir.iterdir()))}, "
          f"Labels: {len(list(output_lbl_dir.iterdir()))}")

# Run preprocessing for all splits
if __name__ == "__main__":
    for split in ["train", "valid", "test"]:
        print(f"Processing {split}...")
        process_split(split)

# This script preprocesses images in the specified dataset splits by applying CLAHE
# and copying corresponding label files. It creates new directories for processed images. 