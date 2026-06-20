import { readFileSync } from "fs";
import { join } from "path";

import { isDatabaseConfigured, prisma } from "./prisma";
import type {
  AnalyzeContext,
  AnalyzeResult,
  RankedRecommendation,
  WeedInfo,
} from "./types";

type DbRecommendation = {
  effectiveness: number;
  rate: string;
  timing: string;
  resistanceNotes: string | null;
  notes: string | null;
  crops: string[];
  growthStages: string[];
  locations: string[];
  herbicide: {
    name: string;
    activeIngredient: string;
    safetyNotes: string | null;
  };
};

type DbWeed = {
  commonName: string;
  scientificName: string;
  family: string;
  lifeCycle: string;
  description: string;
  cropsAffected: string[];
  badges: string[];
  similarSpecies: string[];
  resistance: string | null;
  timingNotes: string | null;
  safety: string | null;
  herbicideRecs: DbRecommendation[];
};

type HerbicideEntry = {
  name: string;
  active_ingredient: string;
  rate: string;
  effectiveness: number;
  timing: string;
  growth_stages: string[];
  crops: string[];
  locations: string[];
  resistance?: string;
  notes?: string;
};

type WeedEntry = {
  scientific_name: string;
  family: string;
  life_cycle: string;
  crops_affected: string[];
  description: string;
  badges: string[];
  similar_species: string[];
  resistance?: string;
  timing_notes?: string;
  safety?: string;
  herbicides: HerbicideEntry[];
};

type WeedDatabase = Record<string, WeedEntry>;

function loadJsonDatabase(): WeedDatabase {
  const jsonPath = join(process.cwd(), "../knowledge/weed_database.json");
  return JSON.parse(readFileSync(jsonPath, "utf-8"));
}

function resolveSpecies(species: string, confidence: number): string {
  const db = loadJsonDatabase();

  if (db[species]) return species;

  const caseMatch = Object.keys(db).find(
    (name) => name.toLowerCase() === species.toLowerCase()
  );
  if (caseMatch) return caseMatch;

  if (confidence < 0.8) {
    for (const [name, weed] of Object.entries(db)) {
      if (
        weed.similar_species.some(
          (similar) => similar.toLowerCase() === species.toLowerCase()
        )
      ) {
        return name;
      }
    }

    const partialMatch = Object.keys(db).find(
      (name) =>
        name.toLowerCase().includes(species.toLowerCase()) ||
        species.toLowerCase().includes(name.toLowerCase())
    );
    if (partialMatch) return partialMatch;
  }

  return species;
}

function matchesLocation(locations: string[], location: string): boolean {
  if (locations.includes(location)) return true;
  const country = location.split("-")[0];
  return locations.includes(`${country}-US`) || locations.includes("US-US");
}

function filterRecommendationsFromJson(
  weed: WeedEntry,
  context: AnalyzeContext
): RankedRecommendation[] {
  const filtered = weed.herbicides
    .filter(
      (h) =>
        h.crops.includes(context.crop) &&
        h.growth_stages.includes(context.growthStage) &&
        matchesLocation(h.locations, context.location)
    )
    .sort((a, b) => b.effectiveness - a.effectiveness);

  if (filtered.length === 0) {
    return weed.herbicides
      .filter(
        (h) =>
          h.crops.includes(context.crop) &&
          h.growth_stages.includes(context.growthStage)
      )
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .map((h, i) => toRankedRecommendation(h, weed.safety ?? "", i + 1));
  }

  return filtered.map((h, i) =>
    toRankedRecommendation(h, weed.safety ?? "", i + 1)
  );
}

function toRankedRecommendation(
  h: HerbicideEntry,
  safety: string,
  rank: number
): RankedRecommendation {
  return {
    rank,
    name: h.name,
    activeIngredient: h.active_ingredient,
    effectiveness: h.effectiveness,
    rate: h.rate,
    timing: h.timing,
    resistanceWarnings: h.resistance ? [h.resistance] : [],
    safetyNotes: safety,
    notes: h.notes ?? null,
  };
}

function weedEntryToInfo(commonName: string, weed: WeedEntry): WeedInfo {
  return {
    commonName,
    scientificName: weed.scientific_name,
    family: weed.family,
    lifeCycle: weed.life_cycle,
    description: weed.description,
    cropsAffected: weed.crops_affected,
    badges: weed.badges,
    similarSpecies: weed.similar_species,
  };
}

async function lookupFromDatabase(
  species: string,
  context: AnalyzeContext
): Promise<AnalyzeResult | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const weed = await prisma.weed.findFirst({
      where: { commonName: species },
      include: {
        herbicideRecs: {
          include: { herbicide: true },
        },
      },
    });

    if (!weed) return null;

    const weedWithRecs = weed as DbWeed;

    let recs = weedWithRecs.herbicideRecs.filter(
      (r) =>
        r.crops.includes(context.crop) &&
        r.growthStages.includes(context.growthStage) &&
        matchesLocation(r.locations, context.location)
    );

    if (recs.length === 0) {
      recs = weedWithRecs.herbicideRecs.filter(
        (r) =>
          r.crops.includes(context.crop) &&
          r.growthStages.includes(context.growthStage)
      );
    }

    recs.sort((a, b) => b.effectiveness - a.effectiveness);

    const recommendations: RankedRecommendation[] = recs.map((r, i) => ({
      rank: i + 1,
      name: r.herbicide.name,
      activeIngredient: r.herbicide.activeIngredient,
      effectiveness: r.effectiveness,
      rate: r.rate,
      timing: r.timing,
      resistanceWarnings: r.resistanceNotes ? [r.resistanceNotes] : [],
      safetyNotes: r.herbicide.safetyNotes ?? weed.safety ?? "",
      notes: r.notes,
    }));

    return {
      species: weed.commonName,
      confidence: 0,
      boundingBoxes: [],
      imageUrl: null,
      weed: {
        commonName: weed.commonName,
        scientificName: weed.scientificName,
        family: weed.family,
        lifeCycle: weed.lifeCycle,
        description: weed.description,
        cropsAffected: weed.cropsAffected,
        badges: weed.badges,
        similarSpecies: weed.similarSpecies,
      },
      recommendations,
      similarSpecies: weed.similarSpecies,
      warnings: {
        resistance: weed.resistance ?? "No resistance data available.",
        timing: weed.timingNotes ?? "Follow product label timing guidelines.",
        safety: weed.safety ?? "Wear appropriate PPE per product labels.",
      },
    };
  } catch (error) {
    console.error("Database lookup failed, falling back to JSON:", error);
    return null;
  }
}

function lookupFromJson(
  species: string,
  context: AnalyzeContext
): AnalyzeResult | null {
  const db = loadJsonDatabase();
  const weed = db[species];
  if (!weed) return null;

  return {
    species,
    confidence: 0,
    boundingBoxes: [],
    imageUrl: null,
    weed: weedEntryToInfo(species, weed),
    recommendations: filterRecommendationsFromJson(weed, context),
    similarSpecies: weed.similar_species,
    warnings: {
      resistance: weed.resistance ?? "No resistance data available.",
      timing: weed.timing_notes ?? "Follow product label timing guidelines.",
      safety: weed.safety ?? "Wear appropriate PPE per product labels.",
    },
  };
}

export async function buildAnalyzeResult(
  species: string,
  confidence: number,
  boundingBoxes: number[][],
  context: AnalyzeContext,
  imageUrl: string | null
): Promise<AnalyzeResult> {
  const resolvedSpecies = resolveSpecies(species, confidence);
  const fromDb = await lookupFromDatabase(resolvedSpecies, context);
  const base = fromDb ?? lookupFromJson(resolvedSpecies, context);

  if (!base) {
    throw new Error(`Unknown species: ${species}`);
  }

  return {
    ...base,
    species: resolvedSpecies,
    confidence,
    boundingBoxes,
    imageUrl,
  };
}
