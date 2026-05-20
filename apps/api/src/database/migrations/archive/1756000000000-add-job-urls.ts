import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds `applications.urls` to support multiple URLs per job.
 * Backfill: when `url` is present and `urls` is empty, copy `url` into `urls[1]`.
 */
export class AddJobUrls1756000000000 implements MigrationInterface {
  name = "AddJobUrls1756000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "urls" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
    await queryRunner.query(`
UPDATE "applications"
SET "urls" = ARRAY["url"]::text[]
WHERE cardinality("urls") = 0
  AND "url" IS NOT NULL
  AND btrim("url") <> '';
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN IF EXISTS "urls"`,
    );
  }
}
