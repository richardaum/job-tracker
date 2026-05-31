import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSummaryGeneratedAt1766100000000 implements MigrationInterface {
  name = "AddSummaryGeneratedAt1766100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_generated_at" timestamp NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_generated_at"`);
  }
}
