import type { MigrationInterface, QueryRunner } from "typeorm";

export class ExtensionActivityEvents1767970000000 implements MigrationInterface {
  name = "ExtensionActivityEvents1767970000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "extension_activity_event_type" AS ENUM (
        'SOURCE_RUN_RECEIVED',
        'SOURCE_RUN_CLAIM_SKIPPED',
        'SOURCE_RUN_STARTED',
        'SOURCE_RUN_JOB_IMPORTED',
        'SOURCE_RUN_COMPLETED',
        'SOURCE_RUN_FAILED',
        'IMPORT_JOB_STARTED',
        'IMPORT_JOB_COMPLETED',
        'IMPORT_JOB_FAILED',
        'AUTH_REFRESHED',
        'AUTH_FAILED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "extension_activity_events" (
        "id" text NOT NULL,
        "user_id" text NOT NULL,
        "type" "extension_activity_event_type" NOT NULL,
        "summary" text NOT NULL,
        "correlation_id" text,
        "payload" text,
        "extension_version" text,
        "browser" text,
        "occurred_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_extension_activity_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_extension_activity_events_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_extension_activity_events_user_occurred"
        ON "extension_activity_events" ("user_id", "occurred_at" DESC)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "extension_activity_events"`);
    await queryRunner.query(`DROP TYPE "extension_activity_event_type"`);
  }
}
