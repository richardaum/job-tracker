import "reflect-metadata";

import { resolve } from "node:path";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { computeScore } from "@api/domains/fit-analysis/scoring/scoring";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config({ path: resolve(process.cwd(), ".env") });

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const dataSource = new DataSource({
    ...buildDataSourceOptions(url),
    entities: [FitAnalysisEntity], // Only need this entity
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(FitAnalysisEntity);

  const analyses = await repo.find();
  console.log(`Found ${analyses.length} fit analysis records to update.`);

  for (const entity of analyses) {
    if (!entity.items || entity.items.length === 0) continue;

    const score = computeScore(entity.items);

    entity.scoreRatio = score.scoreRatio;
    entity.classification = score.classification;
    entity.fitCount = score.fitCount;
    entity.gapCount = score.gapCount;
    entity.unclearCount = score.unclearCount;

    await repo.save(entity);
    console.log(
      `Updated analysis ${entity.id}: Score ${score.scoreRatio.toFixed(2)}%, Classification: ${score.classification}`,
    );
  }

  console.log("Migration completed.");
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
