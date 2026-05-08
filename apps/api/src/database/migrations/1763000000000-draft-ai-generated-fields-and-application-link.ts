import type { MigrationInterface, QueryRunner } from "typeorm";

export class DraftAiGeneratedFieldsAndApplicationLink1763000000000 implements MigrationInterface {
  name = "DraftAiGeneratedFieldsAndApplicationLink1763000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD COLUMN IF NOT EXISTS "draft_application_id" text NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD CONSTRAINT "FK_applications_draft_application"
      FOREIGN KEY ("draft_application_id") REFERENCES "draft_applications"("id")
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_draft_application";
    `);
    await queryRunner.query(`
      ALTER TABLE "applications" DROP COLUMN IF EXISTS "draft_application_id";
    `);
  }
}
