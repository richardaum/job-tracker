import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStageEventSourceEnum1767750000000 implements MigrationInterface {
  name = "AddStageEventSourceEnum1767750000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "stage_event_source" AS ENUM ('Manual', 'System')`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" SET DATA TYPE "stage_event_source" USING CASE "source"
        WHEN 'manual' THEN 'Manual'::"stage_event_source"
        WHEN 'system' THEN 'System'::"stage_event_source"
        WHEN 'linkedin-tracker' THEN 'System'::"stage_event_source"
        WHEN 'ai-draft-review' THEN 'System'::"stage_event_source"
        ELSE 'System'::"stage_event_source"
      END`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" SET DEFAULT 'Manual'::"stage_event_source"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" SET DATA TYPE text USING LOWER("source"::text)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_stage_events" ALTER COLUMN "source" SET DEFAULT 'manual'`,
    );
    await queryRunner.query(`DROP TYPE "stage_event_source"`);
  }
}
