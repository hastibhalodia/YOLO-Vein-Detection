# YOLO-Vein-Detection

An **AI-based portable vein detection system** using YOLO for **painless injection assistance**. This project detects veins in real-time using NIR imaging to guide healthcare workers for precise, low-pain injections.

---

## 🚀 Features   

✅ Real-time vein detection using YOLOv5.  
✅ Confidence overlay on detected veins.  
✅ Portable design concept using NIR illumination and IR camera.  
✅ Streamlit-based UI for user-friendly demonstration.  
✅ Designed for affordable implementation in clinics and rural healthcare.

---

## 🩺 Use Case

- Assist nurses and healthcare workers in **locating veins efficiently.**
- Reduce failed injection attempts.
- Useful in **low-resource settings** where expensive vein-finder devices are unavailable.

---

## 🛠️ Tech Stack

- **YOLOv5 (PyTorch)**
- **OpenCV**
- **Streamlit** (optional for UI)
- **Raspberry Pi + NoIR Camera + NIR LED Ring** (for portable deployment)

---

## 📂 Project Structure

YOLO-Vein-Detection/
├── dataset/
│ ├── raw_images/
│ ├── annotated_images/
│ └── labels/
├── models/
│ └── best.pt
├── outputs/
│ └── detections/
├── train.py
├── detect.py
├── app.py
├── data.yaml
├── requirements.txt
└── README.md


---

## ⚙️ Installation

1️⃣ Clone this repository:
```bash
git clone https://github.com/yourusername/YOLO-Vein-Detection.git
cd YOLO-Vein-Detection


2️⃣ Install dependencies:

pip install -r requirements.txt

3️⃣ (Optional) For YOLOv5 setup:

git clone https://github.com/ultralytics/yolov5
cd yolov5
pip install -r requirements.txt



🏋️‍♂️ Training
Ensure your dataset is prepared and data.yaml is configured.

Run:

python train.py --img 640 --batch 16 --epochs 50 --data data.yaml --weights yolov5s.pt

🔍 Inference
Run detection on an image:

python detect.py --weights models/best.pt --img 640 --source test.jpg
Or on webcam:

python detect.py --weights models/best.pt --img 640 --source 0
🌐 Streamlit Demo
To launch a UI for live testing:

streamlit run app.py
🗓️ Project Timeline
Week 1-2: Literature review and hardware finalization.

Week 3-5: Data collection and annotation.

Week 6-8: Model training and tuning.

Week 9-10: Integration with UI and testing.

Week 11-12: Final testing, documentation, and demonstration.

🧑‍💻 Team
Project Domain: AI/ML, Healthcare, Embedded Systems.

B.Tech AIML Semester Project.

🤝 Contributions
Contributions for:
✅ Improved preprocessing pipelines.
✅ Deployment optimization on Raspberry Pi.
✅ Integration with Android for mobile real-time detection.

are welcome!

📜 License
MIT License.

For queries or mentorship documentation, contact via project communication channel.

yaml
Copy
Edit

---

## ✅ Next:
- Copy this `README.md` into your repo.
- Update:
  - `yourusername` in the clone URL.
  - Team contact info if desired.
- If you need **`requirements.txt` or a ready-to-run `app.py` Streamlit starter** to align with this README,
