import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Dedupes existing companies whose names differ only by case/leading-trailing whitespace,
 * then adds a uniqueness guarantee per user using a functional index so future inserts match.
 */
export class CompaniesUserLowerNameUnique1754000000000 implements MigrationInterface {
  name = "CompaniesUserLowerNameUnique1754000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const groupsWithDuplicates = (await queryRunner.query(
      `
      SELECT user_id AS "user_id", LOWER(TRIM(name)) AS "name_key"
      FROM companies
      GROUP BY user_id, LOWER(TRIM(name))
      HAVING COUNT(*) > 1
    `,
    )) as Array<{ user_id: string; name_key: string }>;

    for (const g of groupsWithDuplicates) {
      const rows = (await queryRunner.query(
        `
        SELECT id FROM companies
        WHERE user_id = $1 AND LOWER(TRIM(name)) = $2
        ORDER BY created_at ASC, id ASC
      `,
        [g.user_id, g.name_key],
      )) as Array<{ id: string }>;

      if (rows.length < 2) {
        continue;
      }

      const canonicalId = rows[0]?.id;
      if (!canonicalId) {
        continue;
      }

      for (let i = 1; i < rows.length; i++) {
        const orphanId = rows[i]?.id;
        if (!orphanId || orphanId === canonicalId) {
          continue;
        }
        await queryRunner.query(`UPDATE applications SET company_id = $1 WHERE company_id = $2`, [
          canonicalId,
          orphanId,
        ]);
        await queryRunner.query(`DELETE FROM companies WHERE id = $1`, [orphanId]);
      }
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_companies_user_lower_name"
      ON "companies" ("user_id", (LOWER(TRIM("name"))))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_companies_user_lower_name"`);
  }
}
