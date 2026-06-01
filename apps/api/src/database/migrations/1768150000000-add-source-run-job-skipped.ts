import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceRunJobSkipped1768150000000 implements MigrationInterface {
  name = "AddSourceRunJobSkipped1768150000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "extension_activity_event_type" ADD VALUE 'SourceRunJobSkipped'`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Cannot remove values from PG enums — no-op
  }
}
