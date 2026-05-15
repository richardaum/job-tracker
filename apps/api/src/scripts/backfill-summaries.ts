import "reflect-metadata";
import "dotenv/config";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { ApplicationEntity } from "@api/database/entities/application.entity";
import { ApplicationNoteEntity } from "@api/database/entities/application-note.entity";
import { ApplicationStageEventEntity } from "@api/database/entities/application-stage-event.entity";
import { ApplicationEventBus } from "@api/domains/applications/application-event.bus";
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
class BackfillModule {}

async function main() {
  process.stdout.write("Booting NestJS...\n");
  const app = await NestFactory.createApplicationContext(BackfillModule, {
    logger: ["error", "warn"],
  });

  const em = app.get(EntityManager);
  const summaryService = app.get(SummaryService);

  const dryRun = process.argv.includes("--dry-run");

  await em.query(
    `UPDATE applications SET summary_status = 'failed', summary_error = 'backfill reset', summary = NULL WHERE summary_status = 'processing'`,
  );

  const rows: Array<{ application_id: string; user_id: string }> =
    await em.query(
      `SELECT DISTINCT a.id AS application_id, a.user_id
       FROM applications a
       INNER JOIN LATERAL (
         SELECT ase.to_stage
         FROM application_stage_events ase
         WHERE ase.application_id = a.id AND ase.user_id = a.user_id
         ORDER BY COALESCE(ase.schedule_at, ase.created_at) DESC, ase.created_at DESC
         LIMIT 1
       ) latest ON true
       WHERE (
         latest.to_stage = 'applied'
         OR latest.to_stage NOT IN ('new', 'applied', 'rejected', 'duplicated')
       )
         AND a.summary_status IS DISTINCT FROM 'processing'
         AND (a.summary IS NULL OR a.summary = '' OR a.summary_status = 'failed')
       ORDER BY a.id`,
    );

  console.log(`Found ${rows.length} applications to backfill`);

  let ok = 0;
  let fail = 0;

  for (const row of rows) {
    const prefix = dryRun ? "[DRY-RUN] " : "";
    process.stdout.write(`  ${prefix}${row.application_id}`);
    if (!dryRun) {
      const [err] = await tryRun(
        summaryService.generateSummarySync(row.application_id, row.user_id),
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
