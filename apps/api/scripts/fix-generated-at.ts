import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { JobEntity } from "@api/database/entities/job.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { tryRun } from "@job-tracker/try-run";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityManager, IsNull, Not } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...buildDataSourceOptions(process.env.DATABASE_URL!) }),
    TypeOrmModule.forFeature([JobEntity]),
  ],
})
class ScriptModule {}

function nowUtcIso(): string {
  return new Date().toISOString();
}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, { logger: ["error", "warn"] });

  const em = app.get(EntityManager);
  const repo = em.getRepository(JobEntity);
  const dryRun = process.argv.includes("--dry-run");

  process.stdout.write("\nFixing generatedAt...\n");

  let ok = 0;
  let fail = 0;

  // Fix 1: summary_metadata COMPLETED with null generatedAt
  const prefix = dryRun ? "[DRY-RUN] " : "";
  process.stdout.write(`  ${prefix}summary_metadata COMPLETED with null generatedAt... `);

  const appsWithMeta = await repo.find({ where: { summaryMetadata: Not(IsNull()) } });
  const fix1 = appsWithMeta.filter(
    (a) => a.summaryMetadata?.status === AsyncMetadataStatusEnum.COMPLETED && !a.summaryMetadata.timestamp,
  );

  if (fix1.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${fix1.length} would be fixed\n`);
  } else {
    for (const app of fix1) {
      app.summaryMetadata = { ...app.summaryMetadata, timestamp: nowUtcIso() } as never;
      const [err] = await tryRun(repo.save(app));
      if (err) {
        process.stdout.write(`\n  ❌ ${app.id}: ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        ok++;
      }
    }
    process.stdout.write(`✓ ${ok} fixed\n`);
  }

  // Fix 2: summary NOT NULL with null summary_metadata
  process.stdout.write(`  ${prefix}summary NOT NULL with null summary_metadata... `);

  const appsWithSummary = await repo.find({ where: { summary: Not(IsNull()), summaryMetadata: IsNull() } });

  if (appsWithSummary.length === 0) {
    process.stdout.write("✓ none to fix\n");
  } else if (dryRun) {
    process.stdout.write(`✓ ${appsWithSummary.length} would be fixed\n`);
  } else {
    let ok2 = 0;
    let fail2 = 0;
    for (const app of appsWithSummary) {
      app.summaryMetadata = { status: AsyncMetadataStatusEnum.COMPLETED, timestamp: nowUtcIso() } as never;
      const [err] = await tryRun(repo.save(app));
      if (err) {
        process.stdout.write(`\n  ❌ ${app.id}: ${err.message.slice(0, 80)}`);
        fail2++;
      } else {
        ok2++;
      }
    }
    process.stdout.write(`✓ ${ok2} fixed\n`);
    ok += ok2;
    fail += fail2;
  }

  process.stdout.write(`\nDone. ${ok} fixes applied, ${fail} failed.\n`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
