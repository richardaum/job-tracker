import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import {
  MatchAnalysisEntity,
  type MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
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

function normalizeType(type: string | null | undefined): RequirementTypeEnum | undefined {
  if (!type) return undefined;
  const words = type.replace(/_/g, " ").toLowerCase();
  const capitalized = words
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  if (
    capitalized === RequirementTypeEnum.MustHave ||
    capitalized === RequirementTypeEnum.NiceToHave ||
    capitalized === RequirementTypeEnum.SoftSkill
  ) {
    return capitalized as RequirementTypeEnum;
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

  process.stdout.write(`\n${prefix}Fixing fit_analysis items -> type (UPPER -> PascalCase)...\n`);
  const fitRepo = em.getRepository(MatchAnalysisEntity);
  const allFit = await fitRepo.find();
  const fixType = allFit.filter((e) =>
    e.items?.some(
      (i: MatchItem) => i.type && normalizeType(i.type) && i.type !== normalizeType(i.type),
    ),
  );

  if (fixType.length === 0) {
    process.stdout.write("  ✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`  ✓ ${fixType.length} would be fixed\n`);
  } else {
    let ok = 0;
    let fail = 0;
    for (const e of fixType) {
      e.items = e.items.map((i: MatchItem) => ({
        ...i,
        type: i.type ? (normalizeType(i.type) as MatchItem["type"]) : i.type,
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
