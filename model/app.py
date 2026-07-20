from __future__ import annotations

import io
import json
import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "efficientnet_skin_cancer.pth"))
CLASSES_PATH = Path(os.getenv("CLASSES_PATH", BASE_DIR / "classes.json"))

LABEL_NAMES: list[str] = []
NUM_CLASSES = 0
model = None
device = None
transform = None


def load_label_names() -> list[str]:
    if not CLASSES_PATH.exists():
        raise FileNotFoundError(f"Classes file not found: {CLASSES_PATH}")

    with CLASSES_PATH.open("r", encoding="utf-8") as file_handle:
        labels = json.load(file_handle)

    if not isinstance(labels, list) or not labels:
        raise ValueError("classes.json must contain a non-empty list of class labels")

    return [str(label) for label in labels]


def get_model(num_classes: int):
    mdl = models.efficientnet_b0(weights=None)
    mdl.classifier[1] = nn.Linear(mdl.classifier[1].in_features, num_classes)
    return mdl


def _load_model():
    global LABEL_NAMES, NUM_CLASSES, model, device, transform

    logger.info("Loading class labels from %s", CLASSES_PATH)
    LABEL_NAMES = load_label_names()
    NUM_CLASSES = len(LABEL_NAMES)
    logger.info("Loaded %d class labels: %s", NUM_CLASSES, LABEL_NAMES)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Using device: %s", device)

    logger.info("Initializing EfficientNet-B0 model...")
    model = get_model(NUM_CLASSES)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model checkpoint not found: {MODEL_PATH}")

    logger.info("Loading weights from %s", MODEL_PATH)
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()
    logger.info("Model loaded and ready for inference")

    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_model()
    logger.info("FastAPI prediction service is ready")
    yield
    logger.info("FastAPI prediction service shutting down")


app = FastAPI(title="Skin Disease Prediction API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Skin Disease Prediction API Running", "status": "ok"}


@app.get("/health")
def health():
    model_ready = model is not None and device is not None
    return {
        "status": "healthy" if model_ready else "not_ready",
        "model_loaded": model_ready,
        "num_classes": NUM_CLASSES,
        "device": str(device) if device else None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None or device is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Please try again in a few seconds.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Invalid image: {error}") from error

    try:
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
    except Exception as error:
        logger.error("Inference failed: %s", error)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error

    predicted_class = LABEL_NAMES[predicted.item()]
    probability_scores = [
        {
            "disease": LABEL_NAMES[index],
            "probability": round(probability.item(), 4),
        }
        for index, probability in enumerate(probabilities.squeeze(0))
    ]

    return {
        "disease": predicted_class,
        "confidence": round(confidence.item() * 100, 2),
        "probabilities": probability_scores,
    }
