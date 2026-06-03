import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAiMessageRoleToEnum1780272918000 implements MigrationInterface {
  name = "ChangeAiMessageRoleToEnum1780272918000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "ai_message_role" AS ENUM ('User', 'Assistant')`);
    await queryRunner.query(
      `ALTER TABLE "ai_messages" ALTER COLUMN "role" TYPE "ai_message_role" USING CASE LOWER("role")
        WHEN 'user' THEN 'User'::"ai_message_role"
        WHEN 'assistant' THEN 'Assistant'::"ai_message_role"
        ELSE 'User'::"ai_message_role"
      END`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ai_messages" ALTER COLUMN "role" TYPE text USING LOWER("role"::text)`);
    await queryRunner.query(`DROP TYPE "ai_message_role"`);
  }
}
