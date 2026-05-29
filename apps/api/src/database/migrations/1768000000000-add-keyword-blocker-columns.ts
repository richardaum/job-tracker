import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddKeywordBlockerColumns1768000000000 implements MigrationInterface {
  name = "AddKeywordBlockerColumns1768000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD COLUMN "blocked_keywords" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD COLUMN "blocked_companies" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP COLUMN "blocked_companies"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP COLUMN "blocked_keywords"
    `);
  }
}
