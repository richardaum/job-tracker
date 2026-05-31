import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { MatchAnalysisEntity, type MatchItem } from "@api/database/entities/match-analysis.entity";
import { MatchVerdictEnum } from "@api/domains/match-analysis/match-verdict.enum";
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

function normalizeVerdict(verdict: string | null | undefined): MatchVerdictEnum | undefined {
  if (!verdict) return undefined;
  const capitalized = verdict.charAt(0).toUpperCase() + verdict.slice(1).toLowerCase();
  if (
    capitalized === MatchVerdictEnum.Fit ||
    capitalized === MatchVerdictEnum.Gap ||
    capitalized === MatchVerdictEnum.Unclear
  ) {
    return capitalized as MatchVerdictEnum;
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

  process.stdout.write(`\n${prefix}Fixing match_analysis items -> verdict (lower -> UPPER)...\n`);
  const fitRepo = em.getRepository(MatchAnalysisEntity);
  const allFit = await fitRepo.find();
  const fixVerdict = allFit.filter((e) =>
    e.items?.some(
      (i: MatchItem) =>
        i.verdict &&
        i.verdict !== i.verdict.charAt(0).toUpperCase() + i.verdict.slice(1).toLowerCase(),
    ),
  );

  if (fixVerdict.length === 0) {
    process.stdout.write("  ✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`  ✓ ${fixVerdict.length} would be fixed\n`);
  } else {
    let ok = 0;
    let fail = 0;
    for (const e of fixVerdict) {
      e.items = e.items.map((i: MatchItem) => ({
        ...i,
        verdict: i.verdict ? (normalizeVerdict(i.verdict) as MatchItem["verdict"]) : i.verdict,
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
