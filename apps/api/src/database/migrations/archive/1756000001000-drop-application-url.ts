import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Removes legacy `applications.url` after clients are migrated to `urls`.
 * Down migration restores `url` from the first entry in `urls` when available.
 */
export class DropApplicationUrl1756000001000 implements MigrationInterface {
  name = "DropApplicationUrl1756000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN IF EXISTS "url"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "url" text`,
    );
    await queryRunner.query(`
UPDATE "applications"
SET "url" = "urls"[1]
WHERE "url" IS NULL
  AND "urls" IS NOT NULL
  AND cardinality("urls") > 0
  AND "urls"[1] IS NOT NULL
  AND btrim("urls"[1]) <> '';
`);
  }
}
