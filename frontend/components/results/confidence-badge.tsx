import { cn } from "@/lib/utils";
import { formatConfidence, getConfidenceLevel } from "@/lib/types";

type ConfidenceBadgeProps = {
  confidence: number;
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        level === "high" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        level === "medium" && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
        level === "low" && "bg-red-500/15 text-red-700 dark:text-red-400"
      )}
    >
      {formatConfidence(confidence)} confidence
    </span>
  );
}

export function getConfidenceLabel(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  if (level === "high") return "High confidence identification";
  if (level === "medium") return "Moderate confidence — verify in field";
  return "Low confidence — consider similar species below";
}
