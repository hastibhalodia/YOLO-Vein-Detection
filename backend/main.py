import io
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from PIL import Image
import torch
import numpy as np

# Load YOLOv5 model (update path to your weights file as needed)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'best.pt')

app = FastAPI()

# Allow CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, force_reload=True)
except Exception as e:
    model = None
    print(f"Model loading failed: {e}")

@app.get("/")
def root():
    return {"message": "YOLO Vein Detection Backend is running."}

@app.post("/predict")
def predict(file: UploadFile = File(...)):
    if model is None:
        return JSONResponse(status_code=500, content={"error": "Model not loaded."})
    try:
        image_bytes = file.file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = model(img, size=640)
        # Render results on image
        results.render()  # updates results.imgs with boxes and labels
        result_img = Image.fromarray(results.ims[0])
        buf = io.BytesIO()
        result_img.save(buf, format='JPEG')
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/jpeg")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
