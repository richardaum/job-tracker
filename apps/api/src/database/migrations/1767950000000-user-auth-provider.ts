import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserAuthProvider1767950000000 implements MigrationInterface {
  name = "UserAuthProvider1767950000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "auth_provider" AS ENUM ('GOOGLE')`);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "provider_name" "auth_provider" NOT NULL DEFAULT 'GOOGLE',
        ADD COLUMN "provider_account_id" text
    `);
    await queryRunner.query(`
      UPDATE "users" SET "provider_account_id" = "google_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "provider_account_id" SET NOT NULL
    `);
    // Baseline (`uq_users_google_id`) vs older restores (`users_google_id_unique`).
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_users_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_google_id_unique"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id"`);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "uq_users_provider"
        UNIQUE ("provider_name", "provider_account_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "provider_name" DROP DEFAULT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "uq_users_provider"`);
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "google_id" text
    `);
    await queryRunner.query(`
      UPDATE "users"
      SET "google_id" = "provider_account_id"
      WHERE "provider_name" = 'GOOGLE'
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "google_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "uq_users_google_id"
        UNIQUE ("google_id")
    `);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider_account_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider_name"`);
    await queryRunner.query(`DROP TYPE "auth_provider"`);
  }
}
