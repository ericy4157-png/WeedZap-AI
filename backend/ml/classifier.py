"""Weed species classifier — mock implementation for MVP."""

from __future__ import annotations

import hashlib
import random

import numpy as np

MOCK_SPECIES = [
    "Palmer Amaranth",
    "Waterhemp",
    "Giant Ragweed",
    "Johnsongrass",
    "Horseweed",
    "Giant Foxtail",
    "Common Lambsquarters",
    "Kochia",
]


def predict(image: np.ndarray) -> dict:
    """
    Predict weed species from preprocessed image.

    Returns species name, confidence score, and optional bounding boxes.
    Uses deterministic hash-based mock for consistent demo results.
    """
    image_bytes = image.tobytes()
    seed = int(hashlib.md5(image_bytes[:4096]).hexdigest(), 16)
    rng = random.Random(seed)

    species = rng.choice(MOCK_SPECIES)
    confidence = round(rng.uniform(0.72, 0.99), 3)

    height, width = image.shape[:2]
    box_w = int(width * rng.uniform(0.3, 0.6))
    box_h = int(height * rng.uniform(0.3, 0.6))
    x = int((width - box_w) * rng.uniform(0.1, 0.5))
    y = int((height - box_h) * rng.uniform(0.1, 0.5))

    return {
        "species": species,
        "confidence": confidence,
        "bounding_boxes": [[x, y, box_w, box_h]],
    }
