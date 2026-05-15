import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixSummaryStatusCase1766200000000 implements MigrationInterface {
  name = "FixSummaryStatusCase1766200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "applications" SET "summary_status" = 'COMPLETED' WHERE "summary_status" = 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "summary_status" SET DEFAULT 'COMPLETED'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "summary_status" SET DEFAULT 'completed'`,
    );
    await queryRunner.query(
      `UPDATE "applications" SET "summary_status" = 'completed' WHERE "summary_status" = 'COMPLETED'`,
    );
  }
}
