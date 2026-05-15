import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds optional `applications.source` (where the job listing was found).
 * Backfill: set from `url` when it contains linkedin, jack, or wellfound (case-insensitive).
 */
export class AddApplicationSource1753000000000 implements MigrationInterface {
  name = "AddApplicationSource1753000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$ BEGIN
  CREATE TYPE "public"."application_source" AS ENUM('Linkedin', 'Jack', 'Wellfound');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "source" "public"."application_source"`,
    );
    await queryRunner.query(`
UPDATE "applications"
SET "source" = CASE
  WHEN "url" IS NULL OR "url" = '' THEN NULL
  WHEN "url" ILIKE '%linkedin%' THEN 'Linkedin'::"public"."application_source"
  WHEN "url" ILIKE '%jack%' THEN 'Jack'::"public"."application_source"
  WHEN "url" ILIKE '%wellfound%' THEN 'Wellfound'::"public"."application_source"
  ELSE NULL
END
WHERE "source" IS NULL;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN IF EXISTS "source"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."application_source"`,
    );
  }
}
