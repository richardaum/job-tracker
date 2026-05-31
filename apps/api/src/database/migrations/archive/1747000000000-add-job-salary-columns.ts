import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Older databases may predate salary columns on `applications`.
 * This migration is idempotent (IF NOT EXISTS / guarded DO blocks).
 */
export class AddJobSalaryColumns1747000000000 implements MigrationInterface {
  name = "AddJobSalaryColumns1747000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$ BEGIN
  CREATE TYPE "public"."salary_period" AS ENUM('year', 'month', 'hour');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_min_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_max_cents" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_currency" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_period" "public"."salary_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_tags" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_tags"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_period"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_currency"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_max_cents"`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_min_cents"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."salary_period" CASCADE`);
  }
}
