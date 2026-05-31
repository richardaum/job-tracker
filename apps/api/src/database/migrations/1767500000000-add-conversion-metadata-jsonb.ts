import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversionMetadataJsonb1767500000000 implements MigrationInterface {
  name = "AddConversionMetadataJsonb1767500000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_metadata" jsonb NULL`,
    );

    await queryRunner.query(`
      UPDATE "draft_applications"
      SET "conversion_metadata" = jsonb_build_object(
        'status', "conversion_status"::text,
        'error', "conversion_error",
        'timestamp', to_char("converted_at", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
      WHERE "conversion_status" != 'IDLE'
    `);

    await queryRunner.query(`ALTER TABLE "draft_applications" DROP COLUMN "conversion_status"`);
    await queryRunner.query(`ALTER TABLE "draft_applications" DROP COLUMN "conversion_error"`);
    await queryRunner.query(`ALTER TABLE "draft_applications" DROP COLUMN "converted_at"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "draft_application_conversion_status"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "draft_application_conversion_status" AS ENUM ('IDLE', 'PROCESSING', 'SUCCEEDED', 'FAILED')`,
    );

    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_status" draft_application_conversion_status NOT NULL DEFAULT 'IDLE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "conversion_error" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "draft_applications" ADD COLUMN "converted_at" timestamptz NULL`,
    );

    await queryRunner.query(`
      UPDATE "draft_applications"
      SET
        "conversion_status" = COALESCE(
          upper("conversion_metadata"->>'status')::draft_application_conversion_status,
          'IDLE'::draft_application_conversion_status
        ),
        "conversion_error" = "conversion_metadata"->>'error',
        "converted_at" = CASE
          WHEN "conversion_metadata"->>'timestamp' IS NOT NULL
          THEN ("conversion_metadata"->>'timestamp')::timestamptz
          ELSE NULL
        END
    `);

    await queryRunner.query(`ALTER TABLE "draft_applications" DROP COLUMN "conversion_metadata"`);
  }
}
