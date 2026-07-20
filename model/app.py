from __future__ import annotations

import io
import json
import os
from pathlib import Path

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "efficientnet_skin_cancer.pth"))
CLASSES_PATH = Path(os.getenv("CLASSES_PATH", BASE_DIR / "classes.json"))


def load_label_names() -> list[str]:
    if not CLASSES_PATH.exists():
        raise FileNotFoundError(f"Classes file not found: {CLASSES_PATH}")

    with CLASSES_PATH.open("r", encoding="utf-8") as file_handle:
        labels = json.load(file_handle)

    if not isinstance(labels, list) or not labels:
        raise ValueError("classes.json must contain a non-empty list of class labels")

    return [str(label) for label in labels]


LABEL_NAMES = load_label_names()
NUM_CLASSES = len(LABEL_NAMES)


def get_model():
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, NUM_CLASSES)
    return model


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = get_model()

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model checkpoint not found: {MODEL_PATH}")

checkpoint = torch.load(MODEL_PATH, map_location=device)
if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
    model.load_state_dict(checkpoint["state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(device)
model.eval()

print("Model loaded successfully")


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Skin Disease Prediction API Running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Invalid image: {error}") from error

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

    predicted_class = LABEL_NAMES[predicted.item()]

    return {
        "disease": predicted_class,
        "confidence": round(confidence.item() * 100, 2),
    }
