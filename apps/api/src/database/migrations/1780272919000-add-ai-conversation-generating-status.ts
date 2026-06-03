import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiConversationGeneratingStatus1780272919000 implements MigrationInterface {
  name = "AddAiConversationGeneratingStatus1780272919000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ai_conversations"
      ADD COLUMN "generating_status" jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ai_conversations"
      DROP COLUMN "generating_status"
    `);
  }
}
