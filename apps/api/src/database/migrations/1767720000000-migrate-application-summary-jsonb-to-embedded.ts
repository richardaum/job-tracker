import type { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateApplicationSummaryJsonbToEmbedded1767720000000 implements MigrationInterface {
  name = "MigrateApplicationSummaryJsonbToEmbedded1767720000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD COLUMN "summary_status" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD COLUMN "summary_error" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD COLUMN "summary_timestamp" timestamptz NULL`,
    );

    await queryRunner.query(`
      UPDATE "jobs"
      SET
        "summary_status" = "summary_metadata"->>'status',
        "summary_error" = "summary_metadata"->>'error',
        "summary_timestamp" = ("summary_metadata"->>'timestamp')::timestamptz
      WHERE "summary_metadata" IS NOT NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "jobs" DROP COLUMN "summary_metadata"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD COLUMN "summary_metadata" jsonb NULL`,
    );

    await queryRunner.query(`
      UPDATE "jobs"
      SET "summary_metadata" = jsonb_build_object(
        'status', "summary_status",
        'error', "summary_error",
        'timestamp', to_char("summary_timestamp", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
      WHERE "summary_status" IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "summary_status"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "summary_error"`);
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP COLUMN "summary_timestamp"`,
    );
  }
}
