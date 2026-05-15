import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDraftApplications1758000000000 implements MigrationInterface {
  name = "CreateDraftApplications1758000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS "draft_applications" (
  "id" text NOT NULL,
  "url" text NOT NULL,
  "html_content" text NOT NULL,
  CONSTRAINT "PK_draft_applications" PRIMARY KEY ("id")
);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "draft_applications"`);
  }
}
