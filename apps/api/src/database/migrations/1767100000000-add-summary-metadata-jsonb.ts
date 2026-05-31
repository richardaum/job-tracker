import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSummaryMetadataJsonb1767100000000 implements MigrationInterface {
  name = "AddSummaryMetadataJsonb1767100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN "summary_metadata" jsonb NULL`);

    await queryRunner.query(`
      UPDATE "applications"
      SET "summary_metadata" = CASE
        WHEN "summary_status" = 'PROCESSING' THEN
          '"{\\"status\\": \\"processing\\"}"'::jsonb
        WHEN "summary_status" = 'FAILED' THEN
          jsonb_build_object(
            'status', 'failed',
            'error', COALESCE("summary_error", 'Unknown error')
          )
        WHEN "summary_status" = 'COMPLETED' AND "summary_generated_at" IS NOT NULL THEN
          jsonb_build_object(
            'status', 'completed',
            'generatedAt', to_char("summary_generated_at", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
          )
        WHEN "summary_status" = 'COMPLETED' THEN
          '"{\\"status\\": \\"completed\\"}"'::jsonb
        ELSE
          NULL
      END
    `);

    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_status"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_error"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_generated_at"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_status" text NOT NULL DEFAULT 'COMPLETED'`,
    );
    await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN "summary_error" text NULL`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "summary_generated_at" timestamp NULL`,
    );

    await queryRunner.query(`
      UPDATE "applications"
      SET
        "summary_status" = CASE
          WHEN "summary_metadata"->>'status' = 'processing' THEN 'PROCESSING'
          WHEN "summary_metadata"->>'status' = 'failed' THEN 'FAILED'
          WHEN "summary_metadata"->>'status' = 'completed' THEN 'COMPLETED'
          ELSE 'COMPLETED'
        END,
        "summary_error" = "summary_metadata"->>'error',
        "summary_generated_at" = CASE
          WHEN "summary_metadata"->>'generatedAt' IS NOT NULL
          THEN ("summary_metadata"->>'generatedAt')::timestamp
          ELSE NULL
        END
    `);

    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "summary_metadata"`);
  }
}
