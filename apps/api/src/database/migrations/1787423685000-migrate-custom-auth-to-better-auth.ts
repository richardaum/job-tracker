import type { MigrationInterface, QueryRunner } from "typeorm";

/** Replaces the custom JWT/JTI identity store with Better Auth's PostgreSQL schema. */
export class MigrateCustomAuthToBetterAuth1787423685000 implements MigrationInterface {
  name = "MigrateCustomAuthToBetterAuth1787423685000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL,
        "image" text,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
        "expiresAt" timestamptz NOT NULL,
        "token" text NOT NULL UNIQUE,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "userId" uuid NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "account" (
        "id" uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
        "issuer" text NOT NULL,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" uuid NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamptz,
        "refreshTokenExpiresAt" timestamptz,
        "scope" text,
        "password" text,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "verification" (
        "id" uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "session_userId_idx" ON "session" ("userId")`);
    await queryRunner.query(`CREATE INDEX "account_userId_idx" ON "account" ("userId")`);
    await queryRunner.query(`CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" ("issuer", "accountId")`);

    await queryRunner.query(`
      INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
      SELECT id::uuid, name, email, true, avatar_url, created_at, updated_at FROM users
    `);
    await queryRunner.query(`
      INSERT INTO "account" ("id", "issuer", "accountId", "providerId", "userId", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'https://accounts.google.com', provider_account_id, 'google', user_id::uuid, created_at, created_at
      FROM user_accounts
    `);

    await queryRunner.query(`DROP TABLE user_accounts`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN token_version`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN refresh_jti`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD COLUMN token_version integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN refresh_jti uuid`);
    await queryRunner.query(`
      CREATE TABLE user_accounts (
        id text NOT NULL PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_name auth_provider NOT NULL,
        provider_account_id text NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "UQ_user_accounts_provider_subject" UNIQUE (provider_name, provider_account_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_accounts_user_id" ON user_accounts (user_id)`);
    await queryRunner.query(`
      INSERT INTO user_accounts (id, user_id, provider_name, provider_account_id, created_at)
      SELECT id::text, "userId"::text, 'Google'::auth_provider, "accountId", "createdAt"
      FROM "account" WHERE "providerId" = 'google'
    `);

    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
