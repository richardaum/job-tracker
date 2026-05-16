import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { FitAnalysisEntity } from "@api/database/entities/fit-analysis.entity";
import { UserPreferencesEntity } from "@api/database/entities/user-preferences.entity";
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
    TypeOrmModule.forFeature([
      ApplicationEntity,
      FitAnalysisEntity,
      UserPreferencesEntity,
      ApplicationStageEventEntity,
    ]),
  ],
})
class ScriptModule {}

function upper(val: string | null | undefined): string | null | undefined {
  return val?.toUpperCase();
}

async function fixJsonbFields(
  em: EntityManager,
  dryRun: boolean,
): Promise<{ ok: number; fail: number }> {
  const prefix = dryRun ? "[DRY-RUN] " : "";
  let ok = 0;
  let fail = 0;

  // 1. summary_metadata -> status
  process.stdout.write(
    `  ${prefix}summary_metadata -> status (lower -> UPPER)... `,
  );
  const appRepo = em.getRepository(ApplicationEntity);
  const allApps = await appRepo.find();
  const fixStatus = allApps.filter(
    (a) =>
      a.summaryMetadata?.status &&
      a.summaryMetadata.status !== upper(a.summaryMetadata.status),
  );
  if (fixStatus.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${fixStatus.length} would be fixed\n`);
  } else {
    for (const a of fixStatus) {
      a.summaryMetadata = {
        ...a.summaryMetadata,
        status: upper(a.summaryMetadata!.status)!,
      };
      const [err] = await tryRun(appRepo.save(a));
      if (err) {
        process.stdout.write(`\n  ❌ ${a.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok++;
      }
    }
    process.stdout.write(`✓ ${ok} fixed\n`);
  }

  // 2. fit_analysis items -> type
  process.stdout.write(
    `  ${prefix}fit_analysis items -> type (lower -> UPPER)... `,
  );
  const fitRepo = em.getRepository(FitAnalysisEntity);
  const allFit = await fitRepo.find();
  const fixType = allFit.filter((e) =>
    e.items?.some((i) => i.type && i.type !== upper(i.type)),
  );
  if (fixType.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${fixType.length} would be fixed\n`);
  } else {
    let ok2 = 0;
    for (const e of fixType) {
      e.items = e.items.map((i) => ({
        ...i,
        type: i.type ? upper(i.type) : i.type,
      }));
      const [err] = await tryRun(fitRepo.save(e));
      if (err) {
        process.stdout.write(`\n  ❌ ${e.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok2++;
      }
    }
    ok += ok2;
    process.stdout.write(`✓ ${ok2} fixed\n`);
  }

  // 3. fit_analysis items -> weight
  process.stdout.write(
    `  ${prefix}fit_analysis items -> weight (lower -> UPPER)... `,
  );
  const fixWeight = allFit.filter((e) =>
    e.items?.some((i) => i.weight && i.weight !== upper(i.weight)),
  );
  if (fixWeight.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${fixWeight.length} would be fixed\n`);
  } else {
    let ok3 = 0;
    for (const e of fixWeight) {
      e.items = e.items.map((i) => ({
        ...i,
        weight: i.weight ? upper(i.weight) : i.weight,
      }));
      const [err] = await tryRun(fitRepo.save(e));
      if (err) {
        process.stdout.write(`\n  ❌ ${e.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok3++;
      }
    }
    ok += ok3;
    process.stdout.write(`✓ ${ok3} fixed\n`);
  }

  // 4. user_preferences items -> weight
  process.stdout.write(
    `  ${prefix}user_preferences items -> weight (lower -> UPPER)... `,
  );
  const prefsRepo = em.getRepository(UserPreferencesEntity);
  const allPrefs = await prefsRepo.find();
  const fixPrefWeight = allPrefs.filter((e) =>
    e.items?.some((i) => i.weight && i.weight !== upper(i.weight)),
  );
  if (fixPrefWeight.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${fixPrefWeight.length} would be fixed\n`);
  } else {
    let ok4 = 0;
    for (const e of fixPrefWeight) {
      e.items = e.items.map((i) => ({
        ...i,
        weight: i.weight ? upper(i.weight) : i.weight,
      }));
      const [err] = await tryRun(prefsRepo.save(e));
      if (err) {
        process.stdout.write(`\n  ❌ ${e.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok4++;
      }
    }
    ok += ok4;
    process.stdout.write(`✓ ${ok4} fixed\n`);
  }

  return { ok, fail };
}

async function scanEnumColumns(em: EntityManager): Promise<void> {
  process.stdout.write("Scanning PG enum columns for lowercase values...\n");
  let totalLower = 0;

  const stageRepo = em.getRepository(ApplicationStageEventEntity);
  const allStages = await stageRepo
    .createQueryBuilder("e")
    .select(["e.id", "e.toStage", "e.fromStage"])
    .getMany();

  const lowerToStage = allStages.filter(
    (e) => e.toStage && e.toStage !== upper(e.toStage),
  );
  if (lowerToStage.length > 0) {
    process.stdout.write(
      `  !  application_stage_events.to_stage: ${lowerToStage.length} row(s) with lowercase\n`,
    );
    totalLower += lowerToStage.length;
  }

  const lowerFromStage = allStages.filter(
    (e) => e.fromStage && e.fromStage !== upper(e.fromStage),
  );
  if (lowerFromStage.length > 0) {
    process.stdout.write(
      `  !  application_stage_events.from_stage: ${lowerFromStage.length} row(s) with lowercase\n`,
    );
    totalLower += lowerFromStage.length;
  }

  const appRepo = em.getRepository(ApplicationEntity);
  const allApps = await appRepo
    .createQueryBuilder("a")
    .select(["a.id", "a.source", "a.salaryPeriod"])
    .getMany();

  const lowerSource = allApps.filter(
    (a) => a.source && a.source !== upper(a.source),
  );
  if (lowerSource.length > 0) {
    process.stdout.write(
      `  !  applications.source: ${lowerSource.length} row(s) with lowercase\n`,
    );
    totalLower += lowerSource.length;
  }

  const lowerPeriod = allApps.filter(
    (a) => a.salaryPeriod && a.salaryPeriod !== upper(a.salaryPeriod),
  );
  if (lowerPeriod.length > 0) {
    process.stdout.write(
      `  !  applications.salary_period: ${lowerPeriod.length} row(s) with lowercase\n`,
    );
    totalLower += lowerPeriod.length;
  }

  if (totalLower === 0) {
    process.stdout.write("  ✓ All scanned PG enum columns are uppercase\n");
  }
}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const dryRun = process.argv.includes("--dry-run");

  process.stdout.write("\nScanning PG enum columns...\n");
  await scanEnumColumns(em);

  process.stdout.write("\nFixing JSONB enum-like fields...\n");
  const { ok, fail } = await fixJsonbFields(em, dryRun);

  process.stdout.write(`\nDone. ${ok} fixes applied, ${fail} failed.\n`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
