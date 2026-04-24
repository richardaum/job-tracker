import type { MigrationInterface, QueryRunner } from "typeorm";
import { randomUUID } from "node:crypto";

export class CreateCompanies1749000000000 implements MigrationInterface {
  name = "CreateCompanies1749000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create companies table
    await queryRunner.query(`CREATE TABLE "companies" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "name" text NOT NULL,
      "description" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`);

    // 2. Add foreign key to users
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // 3. Add company_id to applications (initially nullable)
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "company_id" text`,
    );

    // 4. Migrate existing data
    const applications = await queryRunner.query(
      `SELECT id, user_id, company FROM "applications"`,
    );

    // We want to create unique companies per user/name
    const companiesMap = new Map<string, string>(); // "userId:companyName" -> companyId

    for (const app of applications) {
      const key = `${app.user_id}:${app.company}`;
      let companyId = companiesMap.get(key);

      if (!companyId) {
        companyId = randomUUID();
        await queryRunner.query(
          `INSERT INTO "companies" (id, user_id, name, created_at, updated_at) VALUES ($1, $2, $3, now(), now())`,
          [companyId, app.user_id, app.company],
        );
        companiesMap.set(key, companyId);
      }

      await queryRunner.query(
        `UPDATE "applications" SET company_id = $1 WHERE id = $2`,
        [companyId, app.id],
      );
    }

    // 5. Make company_id NOT NULL and add foreign key
    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action`,
    );

    // 6. Drop old company column
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "company"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add company column back
    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN "company" text`,
    );

    // Restore data
    await queryRunner.query(`
      UPDATE "applications" 
      SET company = (SELECT name FROM "companies" WHERE "companies".id = "applications".company_id)
    `);

    await queryRunner.query(
      `ALTER TABLE "applications" ALTER COLUMN "company" SET NOT NULL`,
    );

    // Drop constraints and column
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "applications_company_id_companies_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "company_id"`,
    );

    // Drop companies table
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
