import type { MLPrediction } from "./types";

const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8000";

export async function predictWeed(image: File): Promise<MLPrediction> {
  const formData = new FormData();
  formData.append("file", image);

  const response = await fetch(`${ML_API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ML prediction failed: ${detail}`);
  }

  return response.json();
}

export async function checkMLHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_API_URL}/health`, {
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
