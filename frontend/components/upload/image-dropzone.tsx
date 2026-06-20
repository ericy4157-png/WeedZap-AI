"use client";

import { motion } from "framer-motion";
import { ImageIcon, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

type ImageDropzoneProps = {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  disabled?: boolean;
};

export function ImageDropzone({
  onFileSelect,
  previewUrl,
  disabled,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleFile(e.dataTransfer.files[0]);
    },
    [disabled, handleFile]
  );

  return (
    <div className="w-full">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
          disabled && "pointer-events-none opacity-60",
          previewUrl && "min-h-[320px]"
        )}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {previewUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full w-full p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded weed preview"
              className="mx-auto max-h-[280px] rounded-xl object-contain"
            />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Click or drag to replace image
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drop your weed photo here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse — PNG, JPG, JPEG
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Best results with clear, well-lit close-ups</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
