"""Image preprocessing utilities for ML inference."""

from __future__ import annotations

import numpy as np
from PIL import Image

TARGET_SIZE = 640


def load_image_from_bytes(data: bytes) -> np.ndarray:
    """Load image bytes into RGB numpy array."""
    image = Image.open(__import__("io").BytesIO(data)).convert("RGB")
    return np.array(image)


def resize_image(image: np.ndarray, size: int = TARGET_SIZE) -> np.ndarray:
    """Resize image maintaining aspect ratio with letterbox padding."""
    pil_image = Image.fromarray(image)
    pil_image = pil_image.resize((size, size), Image.Resampling.LANCZOS)
    return np.array(pil_image)


def normalize_image(image: np.ndarray) -> np.ndarray:
    """Normalize pixel values to 0-1 float range."""
    return image.astype(np.float32) / 255.0


def preprocess(data: bytes) -> np.ndarray:
    """Full preprocessing pipeline: load, resize, normalize."""
    image = load_image_from_bytes(data)
    image = resize_image(image)
    return normalize_image(image)
