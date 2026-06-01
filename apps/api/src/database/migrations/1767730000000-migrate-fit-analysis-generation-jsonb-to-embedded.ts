import type { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateFitAnalysisGenerationJsonbToEmbedded1767730000000 implements MigrationInterface {
  name = "MigrateFitAnalysisGenerationJsonbToEmbedded1767730000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_analysis" ADD COLUMN "generation_status" text NULL`);
    await queryRunner.query(`ALTER TABLE "match_analysis" ADD COLUMN "generation_error" text NULL`);
    await queryRunner.query(`ALTER TABLE "match_analysis" ADD COLUMN "generation_timestamp" timestamptz NULL`);

    await queryRunner.query(`
      UPDATE "match_analysis"
      SET
        "generation_status" = "generation_metadata"->>'status',
        "generation_error" = "generation_metadata"->>'error',
        "generation_timestamp" = ("generation_metadata"->>'timestamp')::timestamptz
      WHERE "generation_metadata" IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "match_analysis" DROP COLUMN "generation_metadata"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match_analysis" ADD COLUMN "generation_metadata" jsonb NULL`);

    await queryRunner.query(`
      UPDATE "match_analysis"
      SET "generation_metadata" = jsonb_build_object(
        'status', "generation_status",
        'error', "generation_error",
        'timestamp', to_char("generation_timestamp", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
      WHERE "generation_status" IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "match_analysis" DROP COLUMN "generation_status"`);
    await queryRunner.query(`ALTER TABLE "match_analysis" DROP COLUMN "generation_error"`);
    await queryRunner.query(`ALTER TABLE "match_analysis" DROP COLUMN "generation_timestamp"`);
  }
}
