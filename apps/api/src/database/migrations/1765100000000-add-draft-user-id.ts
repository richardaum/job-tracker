import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDraftUserId1765100000000 implements MigrationInterface {
  name = "AddDraftUserId1765100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD COLUMN IF NOT EXISTS "user_id" text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      ADD CONSTRAINT "draft_applications_user_id_users_id_fk"
      FOREIGN KEY ("user_id")
      REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      DROP CONSTRAINT IF EXISTS "draft_applications_user_id_users_id_fk";
    `);

    await queryRunner.query(`
      ALTER TABLE "draft_applications"
      DROP COLUMN IF EXISTS "user_id";
    `);
  }
}
