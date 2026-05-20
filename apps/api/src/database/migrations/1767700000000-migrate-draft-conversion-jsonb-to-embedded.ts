import type { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateDraftConversionJsonbToEmbedded1767700000000 implements MigrationInterface {
  name = "MigrateDraftConversionJsonbToEmbedded1767700000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_status" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_error" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_timestamp" timestamptz NULL`,
    );

    await queryRunner.query(`
      UPDATE "draft_applications"
      SET
        "conversion_status" = "conversion_metadata"->>'status',
        "conversion_error" = "conversion_metadata"->>'error',
        "conversion_timestamp" = ("conversion_metadata"->>'timestamp')::timestamptz
      WHERE "conversion_metadata" IS NOT NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "draft_applications" DROP COLUMN "conversion_metadata"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_metadata" jsonb NULL`,
    );

    await queryRunner.query(`
      UPDATE "draft_applications"
      SET "conversion_metadata" = jsonb_build_object(
        'status', "conversion_status",
        'error', "conversion_error",
        'timestamp', to_char("conversion_timestamp", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
      WHERE "conversion_status" IS NOT NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "draft_applications" DROP COLUMN "conversion_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" DROP COLUMN "conversion_error"`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" DROP COLUMN "conversion_timestamp"`,
    );
  }
}
