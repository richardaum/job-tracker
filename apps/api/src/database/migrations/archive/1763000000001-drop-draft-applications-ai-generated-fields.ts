import type { MigrationInterface, QueryRunner } from "typeorm";

export class DropDraftApplicationsAiGeneratedFields1763000000001 implements MigrationInterface {
  name = "DropDraftApplicationsAiGeneratedFields1763000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications" DROP COLUMN IF EXISTS "ai_generated_fields";
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Column intentionally not restored; feature removed.
  }
}
