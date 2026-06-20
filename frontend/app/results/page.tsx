"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ScanSearch } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Header } from "@/components/layout/header";
import { HerbicideTable } from "@/components/results/herbicide-table";
import { SpeciesHero } from "@/components/results/species-hero";
import { WarningsPanel } from "@/components/results/warnings-panel";
import { buttonVariants } from "@/components/ui/button";
import type { AnalyzeResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "weedsense-analyze-result";
const PREVIEW_KEY = "weedsense-preview-url";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const preview = sessionStorage.getItem(PREVIEW_KEY);
    if (stored) {
      setResult(JSON.parse(stored));
    }
    if (preview) {
      setPreviewUrl(preview);
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <ScanSearch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No analysis results</h2>
          <p className="mt-2 text-muted-foreground">
            Upload a weed photo to get started.
          </p>
          <Link
            href="/"
            className={cn(buttonVariants(), "mt-6 rounded-xl")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to upload
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost" }), "rounded-xl")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New scan
          </Link>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SpeciesHero result={result} previewUrl={previewUrl} />
            <HerbicideTable recommendations={result.recommendations} />
            <WarningsPanel result={result} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
