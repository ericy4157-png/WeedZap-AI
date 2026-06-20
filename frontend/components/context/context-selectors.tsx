"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CROPS, GROWTH_STAGES, US_STATES, type AnalyzeContext } from "@/lib/types";

type ContextSelectorsProps = {
  value: Partial<AnalyzeContext>;
  onChange: (context: Partial<AnalyzeContext>) => void;
  disabled?: boolean;
};

export function ContextSelectors({
  value,
  onChange,
  disabled,
}: ContextSelectorsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Crop</label>
        <Select
          value={value.crop}
          onValueChange={(crop) => {
            if (crop) {
              onChange({ ...value, crop: crop as AnalyzeContext["crop"] });
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Select crop" />
          </SelectTrigger>
          <SelectContent>
            {CROPS.map((crop) => (
              <SelectItem key={crop.value} value={crop.value}>
                {crop.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Select
          value={value.location}
          onValueChange={(location) => {
            if (location) onChange({ ...value, location });
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {US_STATES.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Weed Growth Stage</label>
        <Select
          value={value.growthStage}
          onValueChange={(growthStage) => {
            if (growthStage) {
              onChange({
                ...value,
                growthStage: growthStage as AnalyzeContext["growthStage"],
              });
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {GROWTH_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
