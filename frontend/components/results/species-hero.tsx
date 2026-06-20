"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ConfidenceBadge,
  getConfidenceLabel,
} from "@/components/results/confidence-badge";
import { getConfidenceLevel, type AnalyzeResult } from "@/lib/types";

type SpeciesHeroProps = {
  result: AnalyzeResult;
  previewUrl: string | null;
};

export function SpeciesHero({ result, previewUrl }: SpeciesHeroProps) {
  const imageSrc = previewUrl ?? result.imageUrl;
  const level = getConfidenceLevel(result.confidence);
  const bbox = result.boundingBoxes[0];

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2">
          <div className="relative bg-muted/30 p-6">
            {imageSrc ? (
              <div className="relative mx-auto max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={`Identified as ${result.species}`}
                  className="w-full rounded-xl object-contain"
                />
                {bbox && (
                  <div
                    className="pointer-events-none absolute rounded border-2 border-primary shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                    style={{
                      left: `${(bbox[0] / 640) * 100}%`,
                      top: `${(bbox[1] / 640) * 100}%`,
                      width: `${(bbox[2] / 640) * 100}%`,
                      height: `${(bbox[3] / 640) * 100}%`,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                No image preview
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center gap-4 p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <ConfidenceBadge confidence={result.confidence} />
              {level === "low" && (
                <Badge variant="destructive" className="rounded-full">
                  Verify ID
                </Badge>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{result.species}</h2>
              <p className="mt-1 text-muted-foreground italic">
                {result.weed.scientificName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.weed.family}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {getConfidenceLabel(result.confidence)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full capitalize">
                {result.weed.lifeCycle}
              </Badge>
              {result.weed.badges.map((badge) => (
                <Badge key={badge} variant="outline" className="rounded-full">
                  {badge}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
