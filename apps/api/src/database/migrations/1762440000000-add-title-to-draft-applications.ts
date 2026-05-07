import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTitleToDraftApplications1762440000000 implements MigrationInterface {
  name = "AddTitleToDraftApplications1762440000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE "draft_applications"
ADD COLUMN IF NOT EXISTS "title" text NOT NULL DEFAULT '';
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE "draft_applications"
DROP COLUMN IF EXISTS "title";
`);
  }
}
