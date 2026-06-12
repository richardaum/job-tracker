import type { MigrationInterface, QueryRunner } from "typeorm";

export class AiChatUuidPrimaryKeys1780272920000 implements MigrationInterface {
  name = "AiChatUuidPrimaryKeys1780272920000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ai_conversations"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);

    await queryRunner.query(`
      ALTER TABLE "ai_messages"
      ALTER COLUMN "conversation_id" TYPE uuid USING "conversation_id"::uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "ai_messages"
      ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ai_messages"
      ALTER COLUMN "id" DROP DEFAULT,
      ALTER COLUMN "id" TYPE text USING "id"::text
    `);

    await queryRunner.query(`
      ALTER TABLE "ai_messages"
      ALTER COLUMN "conversation_id" TYPE text USING "conversation_id"::text
    `);

    await queryRunner.query(`
      ALTER TABLE "ai_conversations"
      ALTER COLUMN "id" DROP DEFAULT,
      ALTER COLUMN "id" TYPE text USING "id"::text
    `);
  }
}
