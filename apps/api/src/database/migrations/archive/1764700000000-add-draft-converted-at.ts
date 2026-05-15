import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDraftConvertedAt1764700000000 implements MigrationInterface {
  name = "AddDraftConvertedAt1764700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD COLUMN IF NOT EXISTS "converted_at" timestamp NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "converted_at";
    `);
  }
}
