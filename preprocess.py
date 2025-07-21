import cv2
import os
from pathlib import Path

def apply_clahe(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Apply CLAHE(Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl1 = clahe.apply(gray)
    # Convert back to 3-channel for YOLO compatibility
    cl1_bgr = cv2.cvtColor(cl1, cv2.COLOR_GRAY2BGR)
    return cl1_bgr

def process_folder(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    for img_file in os.listdir(input_folder):
        if img_file.endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(input_folder, img_file)
            image = cv2.imread(img_path)
            if image is None:
                print(f"Could not read {img_path}. Skipping.")
                continue
            processed_image = apply_clahe(image)
            out_path = os.path.join(output_folder, img_file)
            cv2.imwrite(out_path, processed_image)
            print(f"Processed and saved: {out_path}")

if __name__ == "__main__":
    # Paths for train and valid folders
    train_input = "Dataset/train/images"
    train_output = "Dataset/train/processed_images"

    valid_input = "Dataset/valid/images"
    valid_output = "Dataset/valid/processed_images"

    print("Processing training images...")
    process_folder(train_input, train_output)

    print("Processing validation images...")
    process_folder(valid_input, valid_output)

    print("Preprocessing completed successfully.")
