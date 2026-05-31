import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { MatchAnalysisEntity, type MatchItem } from "@api/database/entities/match-analysis.entity";
import { MatchSourceEnum } from "@api/domains/match-analysis/match-source.enum";
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

function normalizeSource(source: string | null | undefined): MatchSourceEnum | undefined {
  if (!source) return undefined;
  const capitalized = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
  if (capitalized === MatchSourceEnum.Resume || capitalized === MatchSourceEnum.Preference) {
    return capitalized as MatchSourceEnum;
  }
  return undefined;
}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const dryRun = process.argv.includes("--dry-run");
  const prefix = dryRun ? "[DRY-RUN] " : "";

  process.stdout.write(`\n${prefix}Fixing match_analysis items -> source (lower -> UPPER)...\n`);
  const fitRepo = em.getRepository(MatchAnalysisEntity);
  const allFit = await fitRepo.find();
  const fixSource = allFit.filter((e) =>
    e.items?.some(
      (i: MatchItem) =>
        i.source && i.source !== i.source.charAt(0).toUpperCase() + i.source.slice(1).toLowerCase(),
    ),
  );

  if (fixSource.length === 0) {
    process.stdout.write("  ✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`  ✓ ${fixSource.length} would be fixed\n`);
  } else {
    let ok = 0;
    let fail = 0;
    for (const e of fixSource) {
      e.items = e.items.map((i: MatchItem) => ({
        ...i,
        source: i.source ? (normalizeSource(i.source) as MatchItem["source"]) : i.source,
      }));
      const [err] = await tryRun(fitRepo.save(e));
      if (err) {
        process.stdout.write(`\n  ❌ ${e.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok++;
      }
    }
    process.stdout.write(`✓ ${ok} fixed, ${fail} failed\n`);
  }

  await app.close();
  process.stdout.write("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
