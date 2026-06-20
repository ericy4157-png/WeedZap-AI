"use client";

import { motion } from "framer-motion";
import { Loader2, Leaf, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">WeID AI</h1>
            <p className="text-xs text-muted-foreground">
              Smart weed ID &amp; herbicide guidance
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}

export function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Analyzing weed...</p>
        <p className="text-sm text-muted-foreground">
          Identifying species and ranking herbicides
        </p>
      </div>
    </motion.div>
  );
}

export function AnalyzeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[280px] w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
