import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDraftJobConversionStatus1763200000000 implements MigrationInterface {
  name = "AddDraftJobConversionStatus1763200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'draft_application_conversion_status'
        ) THEN
          CREATE TYPE "draft_application_conversion_status" AS ENUM (
            'idle',
            'processing',
            'succeeded',
            'failed'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD COLUMN IF NOT EXISTS "conversion_status" "draft_application_conversion_status" NOT NULL DEFAULT 'idle';
    `);
    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD COLUMN IF NOT EXISTS "conversion_error" text NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "conversion_error";
    `);
    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "conversion_status";
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'draft_application_conversion_status'
        ) THEN
          DROP TYPE "draft_application_conversion_status";
        END IF;
      END
      $$;
    `);
  }
}
