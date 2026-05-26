import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePayloadToJsonb1767980000000 implements MigrationInterface {
  name = "ChangePayloadToJsonb1767980000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "extension_activity_events"
        ALTER COLUMN "payload" SET DATA TYPE jsonb USING payload::jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "extension_activity_events"
        ALTER COLUMN "payload" SET DATA TYPE text USING payload::text
    `);
  }
}
