import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceRunJobSurfaceAndDetailsImport1780272917000 implements MigrationInterface {
  name = "AddSourceRunJobSurfaceAndDetailsImport1780272917000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "extension_activity_event_type" ADD VALUE 'SourceRunJobSurfaceImport'`);
    await queryRunner.query(`ALTER TYPE "extension_activity_event_type" ADD VALUE 'SourceRunJobDetailsImport'`);
    await queryRunner.query(
      `UPDATE "extension_activity_events" SET "type" = 'SourceRunJobDetailsImport' WHERE "type" = 'SourceRunJobImported'`,
    );
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Cannot remove values from PG enums — no-op
  }
}
