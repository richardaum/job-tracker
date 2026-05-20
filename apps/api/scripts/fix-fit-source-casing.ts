import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import {
  FitAnalysisEntity,
  type FitItem,
} from "@api/database/entities/fit-analysis.entity";
import { FitSourceEnum } from "@api/domains/fit-analysis/fit-source.enum";
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
    TypeOrmModule.forFeature([FitAnalysisEntity]),
  ],
})
class ScriptModule {}

function normalizeSource(
  source: string | null | undefined,
): FitSourceEnum | undefined {
  if (!source) return undefined;
  const capitalized =
    source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
  if (
    capitalized === FitSourceEnum.Resume ||
    capitalized === FitSourceEnum.Preference
  ) {
    return capitalized as FitSourceEnum;
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

  process.stdout.write(
    `\n${prefix}Fixing fit_analysis items -> source (lower -> UPPER)...\n`,
  );
  const fitRepo = em.getRepository(FitAnalysisEntity);
  const allFit = await fitRepo.find();
  const fixSource = allFit.filter((e) =>
    e.items?.some(
      (i) =>
        i.source &&
        i.source !==
          i.source.charAt(0).toUpperCase() + i.source.slice(1).toLowerCase(),
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
      e.items = e.items.map((i) => ({
        ...i,
        source: i.source
          ? (normalizeSource(i.source) as FitItem["source"])
          : i.source,
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
