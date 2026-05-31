import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCorrelationIdToSourceRunId1768170000000 implements MigrationInterface {
  name = "RenameCorrelationIdToSourceRunId1768170000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "extension_activity_events" RENAME COLUMN "correlation_id" TO "source_run_id"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "extension_activity_events" RENAME COLUMN "source_run_id" TO "correlation_id"`,
    );
  }
}
