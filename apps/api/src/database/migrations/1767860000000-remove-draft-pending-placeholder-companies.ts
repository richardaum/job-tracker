import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Drops legacy `"Draft (pending company)"` company rows left from the old draft-capture fallback:
 * orphans jobs first (`company_id` → NULL where supported), then deletes matching `companies` rows.
 *
 * **`down()`** is intentionally empty — deleted tenant rows cannot be recreated without guessing ownership.
 */
export class RemoveDraftPendingPlaceholderCompanies1767860000000 implements MigrationInterface {
  name = "RemoveDraftPendingPlaceholderCompanies1767860000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "jobs"
      SET "company_id" = NULL
      WHERE "company_id" IN (
        SELECT "id"
        FROM "companies"
        WHERE "name" = 'Draft (pending company)'
      )
    `);
    await queryRunner.query(`
      DELETE FROM "companies" WHERE "name" = 'Draft (pending company)'
    `);
  }

  async down(): Promise<void> {
    // Irreversible: deleted placeholder companies cannot be restored without guessing per-user PKs.
  }
}
