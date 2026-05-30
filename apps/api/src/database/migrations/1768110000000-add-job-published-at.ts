import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobPublishedAt1768110000000 implements MigrationInterface {
  name = "AddJobPublishedAt1768110000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jobs"
      ADD COLUMN "published_at" timestamptz
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jobs"
      DROP COLUMN "published_at"
    `);
  }
}
