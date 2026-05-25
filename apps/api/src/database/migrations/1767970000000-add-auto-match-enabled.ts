import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddAutoMatchEnabled1767970000000 implements MigrationInterface {
  name = "AddAutoMatchEnabled1767970000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD COLUMN "auto_match_enabled" boolean NOT NULL DEFAULT false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP COLUMN "auto_match_enabled"
    `);
  }
}
