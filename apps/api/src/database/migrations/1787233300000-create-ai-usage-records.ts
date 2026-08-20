import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiUsageRecords1787233300000 implements MigrationInterface {
  name = "CreateAiUsageRecords1787233300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "ai_usage_source" AS ENUM ('PersonalKey', 'Trial')`);
    await queryRunner.query(`
      CREATE TABLE "ai_usage_records" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "source" "ai_usage_source" NOT NULL,
        "input_tokens" integer NOT NULL,
        "output_tokens" integer NOT NULL,
        "total_tokens" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_usage_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ai_usage_records_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_usage_records_user_source_created_at" ON "ai_usage_records" ("user_id", "source", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ai_usage_records"`);
    await queryRunner.query(`DROP TYPE "ai_usage_source"`);
  }
}
