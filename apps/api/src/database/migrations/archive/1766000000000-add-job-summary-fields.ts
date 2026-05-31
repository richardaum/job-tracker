import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobSummaryFields1766000000000 implements MigrationInterface {
  name = "AddJobSummaryFields1766000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN "summary" text NULL`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_status" text NOT NULL DEFAULT 'completed'`,
    );
    await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN "summary_error" text NULL`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_generated_at" timestamp NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_error"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_generated_at"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_status"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary"`);
  }
}
