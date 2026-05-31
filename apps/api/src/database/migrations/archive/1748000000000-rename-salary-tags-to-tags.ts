import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSalaryTagsToTags1748000000000 implements MigrationInterface {
  name = "RenameSalaryTagsToTags1748000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(`UPDATE "applications" SET "tags" = "salary_tags" WHERE "salary_tags" IS NOT NULL`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "salary_tags"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "salary_tags" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(`UPDATE "applications" SET "salary_tags" = "tags" WHERE "tags" IS NOT NULL`);
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "tags"`);
  }
}
