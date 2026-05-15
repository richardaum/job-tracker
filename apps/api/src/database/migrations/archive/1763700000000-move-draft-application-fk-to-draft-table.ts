import type { MigrationInterface, QueryRunner } from "typeorm";

export class MoveDraftApplicationFkToDraft1763700000000 implements MigrationInterface {
  name = "MoveDraftApplicationFkToDraft1763700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD COLUMN IF NOT EXISTS "application_id" text NULL;
    `);

    await queryRunner.query(`
      UPDATE "draft_applications" AS d
      SET application_id = picked.app_id
      FROM (
        SELECT DISTINCT ON (a."draft_application_id")
          a."draft_application_id" AS draft_id,
          a.id AS app_id
        FROM "applications" a
        WHERE a."draft_application_id" IS NOT NULL
        ORDER BY a."draft_application_id", a."created_at" DESC
      ) AS picked
      WHERE d.id = picked.draft_id;
    `);

    await queryRunner.query(`
      ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_draft_application";
    `);
    await queryRunner.query(`
      ALTER TABLE "applications" DROP COLUMN IF EXISTS "draft_application_id";
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_draft_applications_application_id"
      ON "draft_applications" ("application_id")
      WHERE "application_id" IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD CONSTRAINT "FK_draft_applications_application"
      FOREIGN KEY ("application_id") REFERENCES "applications"("id")
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
    `);

    await queryRunner.query(`
      UPDATE "applications" AS a
      SET "draft_application_id" = d.id
      FROM "draft_applications" d
      WHERE d."application_id" IS NOT NULL
        AND d."application_id" = a.id;
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP CONSTRAINT IF EXISTS "FK_draft_applications_application";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_draft_applications_application_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "application_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD CONSTRAINT "FK_applications_draft_application"
      FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id")
      ON DELETE SET NULL;
    `);
  }
}
