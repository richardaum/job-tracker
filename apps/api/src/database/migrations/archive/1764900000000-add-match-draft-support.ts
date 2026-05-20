import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchDraftSupport1764900000000 implements MigrationInterface {
  name = "AddMatchDraftSupport1764900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ALTER COLUMN "application_id" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD CONSTRAINT "fit_analysis_draft_application_id_unique" UNIQUE ("draft_application_id");
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD CONSTRAINT "fit_analysis_draft_application_id_draft_applications_id_fk"
      FOREIGN KEY ("draft_application_id")
      REFERENCES "public"."draft_applications"("id")
      ON DELETE cascade ON UPDATE no action;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      DROP CONSTRAINT IF EXISTS "fit_analysis_draft_application_id_draft_applications_id_fk";
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      DROP CONSTRAINT IF EXISTS "fit_analysis_draft_application_id_unique";
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      DROP COLUMN IF EXISTS "draft_application_id";
    `);

    await queryRunner.query(`
      DELETE FROM "fit_analysis" WHERE "application_id" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ALTER COLUMN "application_id" SET NOT NULL;
    `);
  }
}
