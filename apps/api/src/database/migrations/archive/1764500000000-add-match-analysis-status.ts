import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchAnalysisStatus1764500000000 implements MigrationInterface {
  name = "AddMatchAnalysisStatus1764500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'fit_analysis_status'
        ) THEN
          CREATE TYPE "fit_analysis_status" AS ENUM (
            'processing',
            'completed',
            'failed'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD COLUMN IF NOT EXISTS "status" "fit_analysis_status" NOT NULL DEFAULT 'completed';
    `);
    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD COLUMN IF NOT EXISTS "error" text NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fit_analysis" DROP COLUMN IF EXISTS "error";
    `);
    await queryRunner.query(`
      ALTER TABLE "fit_analysis" DROP COLUMN IF EXISTS "status";
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'fit_analysis_status'
        ) THEN
          DROP TYPE "fit_analysis_status";
        END IF;
      END
      $$;
    `);
  }
}
