import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchAnalysisUserId1765000000000 implements MigrationInterface {
  name = "AddMatchAnalysisUserId1765000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD COLUMN IF NOT EXISTS "user_id" text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      ADD CONSTRAINT "fit_analysis_user_id_users_id_fk"
      FOREIGN KEY ("user_id")
      REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      DROP CONSTRAINT IF EXISTS "fit_analysis_user_id_users_id_fk";
    `);

    await queryRunner.query(`
      ALTER TABLE "fit_analysis"
      DROP COLUMN IF EXISTS "user_id";
    `);
  }
}
