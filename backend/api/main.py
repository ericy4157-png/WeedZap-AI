"""FastAPI application for WeedSense ML inference."""

from __future__ import annotations

import os

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml.classifier import predict
from ml.preprocess import preprocess

app = FastAPI(title="WeedSense ML API", version="0.1.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictResponse(BaseModel):
    species: str
    confidence: float
    bounding_boxes: list[list[int]]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
async def predict_weed(file: UploadFile = File(...)):
    if file.content_type not in {"image/png", "image/jpeg", "image/jpg"}:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Only PNG and JPEG images are supported")

    data = await file.read()
    image = preprocess(data)
    result = predict(image)
    return PredictResponse(**result)
