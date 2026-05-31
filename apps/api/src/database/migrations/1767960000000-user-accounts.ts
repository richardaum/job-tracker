import type { MigrationInterface, QueryRunner } from "typeorm";

/** Splits OAuth identity rows out of `users` into `user_accounts` (user 1:N accounts). */
export class UserAccounts1767960000000 implements MigrationInterface {
  name = "UserAccounts1767960000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_accounts" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "provider_name" "auth_provider" NOT NULL,
        "provider_account_id" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_accounts_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_user_accounts_provider_subject"
          UNIQUE ("provider_name", "provider_account_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_accounts_user_id"
        ON "user_accounts" ("user_id")
    `);
    await queryRunner.query(`
      INSERT INTO "user_accounts"
        ("id", "user_id", "provider_name", "provider_account_id")
      SELECT
        gen_random_uuid()::text,
        "id",
        "provider_name",
        "provider_account_id"
      FROM "users"
    `);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_users_provider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "provider_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "provider_name"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "provider_name" "auth_provider",
        ADD COLUMN IF NOT EXISTS "provider_account_id" text
    `);
    await queryRunner.query(`
      UPDATE "users" u SET
        "provider_name" = a."provider_name",
        "provider_account_id" = a."provider_account_id"
      FROM (
        SELECT DISTINCT ON ("user_id")
          "user_id",
          "provider_name",
          "provider_account_id"
        FROM "user_accounts"
        ORDER BY "user_id", "created_at" ASC
      ) AS a
      WHERE u.id = a."user_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "provider_name" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "provider_account_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "uq_users_provider"
        UNIQUE ("provider_name", "provider_account_id")
    `);
    await queryRunner.query(`DROP INDEX "IDX_user_accounts_user_id"`);
    await queryRunner.query(`DROP TABLE "user_accounts"`);
  }
}
