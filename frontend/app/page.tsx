"use client";

import { AnimatePresence } from "framer-motion";
import { ScanSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ContextSelectors } from "@/components/context/context-selectors";
import { Header, LoadingOverlay } from "@/components/layout/header";
import { ImageDropzone } from "@/components/upload/image-dropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzeContext, AnalyzeResult } from "@/lib/types";

const STORAGE_KEY = "weedsense-analyze-result";
const PREVIEW_KEY = "weedsense-preview-url";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState<Partial<AnalyzeContext>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = useMemo(
    () =>
      Boolean(file) &&
      Boolean(context.crop) &&
      Boolean(context.location) &&
      Boolean(context.growthStage),
    [file, context]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    (selected: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    },
    [previewUrl]
  );

  const handleAnalyze = async () => {
    if (!file || !isReady) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("crop", context.crop!);
      formData.append("location", context.location!);
      formData.append("growthStage", context.growthStage!);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Analysis failed");
      }

      const result: AnalyzeResult = await response.json();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      if (previewUrl) {
        sessionStorage.setItem(PREVIEW_KEY, previewUrl);
      }
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Identify weeds. Get herbicide guidance.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Upload a photo, tell us your crop and field context, and receive
            ranked treatment recommendations.
          </p>
        </div>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScanSearch className="h-5 w-5 text-primary" />
              Weed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageDropzone
              onFileSelect={handleFileSelect}
              previewUrl={previewUrl}
              disabled={isAnalyzing}
            />

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Field context (required for accurate recommendations)
              </h3>
              <ContextSelectors
                value={context}
                onChange={setContext}
                disabled={isAnalyzing}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full rounded-xl text-base"
              disabled={!isReady || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Weed"}
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by Weed-AI datasets · Always verify with local extension
          guidance
        </p>
      </main>

      <AnimatePresence>
        {isAnalyzing && <LoadingOverlay />}
      </AnimatePresence>
    </div>
  );
}
