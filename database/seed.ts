import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

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

async function main() {
  const jsonPath = join(__dirname, "../knowledge/weed_database.json");
  const data: WeedDatabase = JSON.parse(readFileSync(jsonPath, "utf-8"));

  for (const [commonName, weed] of Object.entries(data)) {
    const createdWeed = await prisma.weed.upsert({
      where: { commonName },
      update: {
        scientificName: weed.scientific_name,
        family: weed.family,
        lifeCycle: weed.life_cycle,
        description: weed.description,
        cropsAffected: weed.crops_affected,
        badges: weed.badges,
        similarSpecies: weed.similar_species,
        resistance: weed.resistance ?? null,
        timingNotes: weed.timing_notes ?? null,
        safety: weed.safety ?? null,
      },
      create: {
        commonName,
        scientificName: weed.scientific_name,
        family: weed.family,
        lifeCycle: weed.life_cycle,
        description: weed.description,
        cropsAffected: weed.crops_affected,
        badges: weed.badges,
        similarSpecies: weed.similar_species,
        resistance: weed.resistance ?? null,
        timingNotes: weed.timing_notes ?? null,
        safety: weed.safety ?? null,
      },
    });

    for (const herb of weed.herbicides) {
      const herbicide = await prisma.herbicide.upsert({
        where: {
          name_activeIngredient: {
            name: herb.name,
            activeIngredient: herb.active_ingredient,
          },
        },
        update: {
          safetyNotes: weed.safety ?? null,
        },
        create: {
          name: herb.name,
          activeIngredient: herb.active_ingredient,
          safetyNotes: weed.safety ?? null,
        },
      });

      await prisma.recommendation.upsert({
        where: {
          weedId_herbicideId_rate: {
            weedId: createdWeed.id,
            herbicideId: herbicide.id,
            rate: herb.rate,
          },
        },
        update: {
          effectiveness: herb.effectiveness,
          timing: herb.timing,
          growthStages: herb.growth_stages,
          crops: herb.crops,
          locations: herb.locations,
          resistanceNotes: herb.resistance ?? null,
          notes: herb.notes ?? null,
        },
        create: {
          weedId: createdWeed.id,
          herbicideId: herbicide.id,
          effectiveness: herb.effectiveness,
          rate: herb.rate,
          timing: herb.timing,
          growthStages: herb.growth_stages,
          crops: herb.crops,
          locations: herb.locations,
          resistanceNotes: herb.resistance ?? null,
          notes: herb.notes ?? null,
        },
      });
    }
  }

  console.log(`Seeded ${Object.keys(data).length} weeds`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
