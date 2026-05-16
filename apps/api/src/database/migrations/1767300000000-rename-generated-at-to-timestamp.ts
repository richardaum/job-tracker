import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameGeneratedAtToTimestamp1767300000000 implements MigrationInterface {
  name = "RenameGeneratedAtToTimestamp1767300000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "applications"
      SET "summary_metadata" = ("summary_metadata"::jsonb - 'generatedAt') || jsonb_build_object('timestamp', "summary_metadata"->'generatedAt')
      WHERE "summary_metadata" ? 'generatedAt'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "applications"
      SET "summary_metadata" = ("summary_metadata"::jsonb - 'timestamp') || jsonb_build_object('generatedAt', "summary_metadata"->'timestamp')
      WHERE "summary_metadata" ? 'timestamp'
    `);
  }
}
