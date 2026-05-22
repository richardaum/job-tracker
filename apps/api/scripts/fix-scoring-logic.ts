import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { MatchAnalysisEntity } from "@api/database/entities/match-analysis.entity";
import { computeScore } from "@api/domains/match-analysis/scoring/scoring";
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
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const repo = em.getRepository(MatchAnalysisEntity);
  const dryRun = process.argv.includes("--dry-run");

  const analyses = await repo.find();
  process.stdout.write(`Found ${analyses.length} match analysis records.\n`);

  let ok = 0;
  let fail = 0;

  for (const entity of analyses) {
    if (!entity.items || entity.items.length === 0) continue;

    const prefix = dryRun ? "[DRY-RUN] " : "";
    process.stdout.write(`  ${prefix}${entity.id}`);

    if (dryRun) {
      const score = computeScore(entity.items);
      process.stdout.write(
        ` → Score ${score.scoreRatio.toFixed(2)}%, ${score.classification}\n`,
      );
      continue;
    }

    const score = computeScore(entity.items);
    entity.scoreRatio = score.scoreRatio;
    entity.classification = score.classification;
    entity.matchCount = score.matchCount;
    entity.gapCount = score.gapCount;
    entity.unclearCount = score.unclearCount;

    const [err] = await tryRun(repo.save(entity));
    if (err) {
      process.stdout.write(` ❌ ${err.message.slice(0, 80)}\n`);
      fail++;
    } else {
      process.stdout.write(
        ` ✅ Score ${score.scoreRatio.toFixed(2)}%, ${score.classification}\n`,
      );
      ok++;
    }
  }

  process.stdout.write(
    `\nDone. ${ok} updated, ${fail} failed${dryRun ? " (dry-run)" : ""}.\n`,
  );
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
