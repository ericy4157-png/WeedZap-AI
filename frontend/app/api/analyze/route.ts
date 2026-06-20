import { NextRequest, NextResponse } from "next/server";

import { predictWeed } from "@/lib/ml-client";
import { buildAnalyzeResult } from "@/lib/recommendation-engine";
import { uploadImage, isStorageConfigured } from "@/lib/supabase";
import type { AnalyzeContext } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const crop = formData.get("crop");
    const location = formData.get("location");
    const growthStage = formData.get("growthStage");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!crop || !location || !growthStage) {
      return NextResponse.json(
        { error: "Crop, location, and growth stage are required" },
        { status: 400 }
      );
    }

    const context: AnalyzeContext = {
      crop: crop as AnalyzeContext["crop"],
      location: location as string,
      growthStage: growthStage as AnalyzeContext["growthStage"],
    };

    let imageUrl: string | null = null;
    if (isStorageConfigured()) {
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
      imageUrl = await uploadImage(image, filename);
    }

    const prediction = await predictWeed(image);

    const result = await buildAnalyzeResult(
      prediction.species,
      prediction.confidence,
      prediction.bounding_boxes,
      context,
      imageUrl
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
