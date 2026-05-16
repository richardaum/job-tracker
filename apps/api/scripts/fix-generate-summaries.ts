import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
import { ApplicationRepository } from "@api/domains/applications/applications.repository";
import { SummaryService } from "@api/domains/applications/summary/summary.service";
import { SummaryAiService } from "@api/domains/applications/summary/summary-ai.service";
import { LibAiModule } from "@api/lib/ai";
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
      ApplicationNoteEntity,
      ApplicationStageEventEntity,
    ]),
    LibAiModule,
  ],
  providers: [ApplicationEventBus, SummaryAiService, SummaryService],
})
class ScriptModule {}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(ScriptModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const summaryService = app.get(SummaryService);

  const appRepo = new ApplicationRepository(
    em.getRepository(ApplicationEntity),
    em.getRepository(ApplicationStageEventEntity),
  );

  const dryRun = process.argv.includes("--dry-run");

  // Reset stale processing entries
  if (!dryRun) {
    const resetCount = await appRepo.resetStaleSummaryProcessing();
    if (resetCount > 0) {
      process.stdout.write(`Reset ${resetCount} stale processing entries.\n`);
    }
  }

  const latestStageSub = `(
    SELECT e.to_stage FROM application_stage_events e
    WHERE e.application_id = a.id AND e.user_id = a.user_id
    ORDER BY COALESCE(e.schedule_at, e.created_at) DESC, e.created_at DESC, e.id DESC
    LIMIT 1
  )`;

  const rows = await em
    .getRepository(ApplicationEntity)
    .createQueryBuilder("a")
    .select(["a.id", "a.userId"])
    .where(
      `(${latestStageSub}) = :applied OR (${latestStageSub}) NOT IN (:...terminal)`,
      {
        applied: "APPLIED",
        terminal: ["NEW", "APPLIED", "REJECTED", "DUPLICATED"],
      },
    )
    .andWhere(
      `a.summary_metadata IS NULL OR a.summary_metadata->>'status' != :processing`,
      { processing: "PROCESSING" },
    )
    .andWhere(
      `a.summary IS NULL OR a.summary = '' OR a.summary_metadata->>'status' = :failed`,
      { failed: "FAILED" },
    )
    .orderBy("a.id")
    .getMany();

  console.log(`Found ${rows.length} applications to process`);

  let ok = 0;
  let fail = 0;

  for (const row of rows) {
    const prefix = dryRun ? "[DRY-RUN] " : "";
    process.stdout.write(`  ${prefix}${row.id}`);
    if (!dryRun) {
      const [err] = await tryRun(
        summaryService.generateSummarySync(row.id, row.userId),
      );
      if (err) {
        process.stdout.write(` ❌ ${err.message.slice(0, 80)}`);
        fail++;
      } else {
        process.stdout.write(` ✅`);
        ok++;
      }
    }
    process.stdout.write("\n");
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
