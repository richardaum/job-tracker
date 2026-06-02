import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiConversationsAndMessages1768180000000 implements MigrationInterface {
  name = "CreateAiConversationsAndMessages1768180000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ai_conversations" (
        "id"         text PRIMARY KEY NOT NULL,
        "job_id"     text NOT NULL,
        "user_id"    text NOT NULL,
        "title"      text NOT NULL DEFAULT 'New conversation',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ai_conversations_job_id" ON "ai_conversations" ("job_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ai_conversations_user_id" ON "ai_conversations" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_messages" (
        "id"              text PRIMARY KEY NOT NULL,
        "conversation_id" text NOT NULL,
        "role"            text NOT NULL,
        "content"         text NOT NULL,
        "created_at"      timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_ai_messages_conversation_id" ON "ai_messages" ("conversation_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ai_messages"`);
    await queryRunner.query(`DROP TABLE "ai_conversations"`);
  }
}
