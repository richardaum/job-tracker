import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserSettings1767900000000 implements MigrationInterface {
  name = "UserSettings1767900000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "user_id" text NOT NULL,
        "auto_fill_enabled" boolean NOT NULL DEFAULT false,
        "auto_summary_enabled" boolean NOT NULL DEFAULT false,
        "duplicate_window_days" integer NOT NULL DEFAULT 30,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_settings_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "fk_user_settings_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_settings"`);
  }
}
