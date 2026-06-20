export type GrowthStage = "seedling" | "vegetative" | "mature";

export type Crop =
  | "corn"
  | "soybean"
  | "wheat"
  | "cotton"
  | "sorghum"
  | "sugar beet";

export type AnalyzeContext = {
  crop: Crop;
  location: string;
  growthStage: GrowthStage;
};

export type MLPrediction = {
  species: string;
  confidence: number;
  bounding_boxes: number[][];
};

export type RankedRecommendation = {
  rank: number;
  name: string;
  activeIngredient: string;
  effectiveness: number;
  rate: string;
  timing: string;
  resistanceWarnings: string[];
  safetyNotes: string;
  notes: string | null;
};

export type WeedInfo = {
  commonName: string;
  scientificName: string;
  family: string;
  lifeCycle: string;
  description: string;
  cropsAffected: string[];
  badges: string[];
  similarSpecies: string[];
};

export type AnalyzeWarnings = {
  resistance: string;
  timing: string;
  safety: string;
};

export type AnalyzeResult = {
  species: string;
  confidence: number;
  boundingBoxes: number[][];
  imageUrl: string | null;
  weed: WeedInfo;
  recommendations: RankedRecommendation[];
  similarSpecies: string[];
  warnings: AnalyzeWarnings;
};

export const CROPS: { value: Crop; label: string }[] = [
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" },
  { value: "wheat", label: "Wheat" },
  { value: "cotton", label: "Cotton" },
  { value: "sorghum", label: "Sorghum" },
  { value: "sugar beet", label: "Sugar Beet" },
];

export const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
  { value: "seedling", label: "Seedling" },
  { value: "vegetative", label: "Vegetative" },
  { value: "mature", label: "Mature" },
];

export const US_STATES: { value: string; label: string }[] = [
  { value: "US-IA", label: "Iowa" },
  { value: "US-IL", label: "Illinois" },
  { value: "US-IN", label: "Indiana" },
  { value: "US-NE", label: "Nebraska" },
  { value: "US-KS", label: "Kansas" },
  { value: "US-MO", label: "Missouri" },
  { value: "US-TX", label: "Texas" },
  { value: "US-CO", label: "Colorado" },
  { value: "US-ND", label: "North Dakota" },
  { value: "US-US", label: "United States (General)" },
];

export function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.95) return "high";
  if (confidence >= 0.8) return "medium";
  return "low";
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}
