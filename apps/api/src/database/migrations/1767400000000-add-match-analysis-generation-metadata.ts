import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddFitAnalysisGenerationMetadata1767400000000 implements MigrationInterface {
  name = "AddFitAnalysisGenerationMetadata1767400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD COLUMN "generation_metadata" jsonb NULL`,
    );

    await queryRunner.query(`
      UPDATE "fit_analysis"
      SET "generation_metadata" = jsonb_build_object(
        'status', "status"::text,
        'error', "error",
        'timestamp', to_char("updated_at", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
    `);

    await queryRunner.query(`ALTER TABLE "fit_analysis" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "fit_analysis" DROP COLUMN "error"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fit_analysis_status"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "fit_analysis_status" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD COLUMN "status" fit_analysis_status`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ADD COLUMN "error" text NULL`,
    );

    await queryRunner.query(`
      UPDATE "fit_analysis"
      SET
        "status" = COALESCE(upper("generation_metadata"->>'status')::fit_analysis_status, 'COMPLETED'::fit_analysis_status),
        "error" = "generation_metadata"->>'error'
    `);

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "fit_analysis" ALTER COLUMN "status" SET DEFAULT 'COMPLETED'::fit_analysis_status`,
    );

    await queryRunner.query(
      `ALTER TABLE "fit_analysis" DROP COLUMN "generation_metadata"`,
    );
  }
}
