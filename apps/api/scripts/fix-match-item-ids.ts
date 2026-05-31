import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { createMatchItemId } from "@api/domains/match-analysis/match-item-id.util";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(process.env.DATABASE_URL!),
    }),
    TypeOrmModule.forFeature([MatchAnalysisEntity]),
  ],
})
class ScriptModule {}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const prefix = dryRun ? "[DRY-RUN] " : "";

  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const repo = em.getRepository(MatchAnalysisEntity);

  process.stdout.write(`\n${prefix}Backfilling match item ids...\n`);

  const analyses = await repo.find();
  let updatedAnalyses = 0;
  let updatedItems = 0;
  let failed = 0;

  for (const analysis of analyses) {
    if (!analysis.items?.length) {
      continue;
    }

    let changed = false;
    const nextItems = analysis.items.map((item) => {
      if (item.id) {
        return item;
      }
      changed = true;
      updatedItems++;
      return { ...item, id: createMatchItemId() };
    });

    if (!changed) {
      continue;
    }

    if (dryRun) {
      updatedAnalyses++;
      continue;
    }

    analysis.items = nextItems;
    const [err] = await tryRun(repo.save(analysis));
    if (err) {
      process.stdout.write(`\n  ❌ ${analysis.id}: ${err.message.slice(0, 120)}\n`);
      failed++;
      continue;
    }

    updatedAnalyses++;
  }

  process.stdout.write(
    `\nDone. ${updatedAnalyses} analyses ${dryRun ? "would be" : ""} updated, ${updatedItems} items backfilled, ${failed} failed.\n`,
  );

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
