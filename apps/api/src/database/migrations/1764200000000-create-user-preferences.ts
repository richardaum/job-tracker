import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserPreferences1764200000000 implements MigrationInterface {
  name = "CreateUserPreferences1764200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_preferences" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "items" jsonb DEFAULT '[]' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`);

    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "uq_user_preferences_user_id" UNIQUE ("user_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_preferences" DROP CONSTRAINT "user_preferences_user_id_users_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" DROP CONSTRAINT "uq_user_preferences_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_preferences"`);
  }
}
