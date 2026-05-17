import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserPreferencesToWorkPreferences1767600000000 implements MigrationInterface {
  name = "RenameUserPreferencesToWorkPreferences1767600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_preferences" RENAME TO "work_preferences"`,
    );
    await queryRunner.query(
      `ALTER INDEX "uq_user_preferences_user_id" RENAME TO "uq_work_preferences_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences" RENAME CONSTRAINT "user_preferences_user_id_users_id_fk" TO "work_preferences_user_id_users_id_fk"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_preferences" RENAME CONSTRAINT "work_preferences_user_id_users_id_fk" TO "user_preferences_user_id_users_id_fk"`,
    );
    await queryRunner.query(
      `ALTER INDEX "uq_work_preferences_user_id" RENAME TO "uq_user_preferences_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_preferences" RENAME TO "user_preferences"`,
    );
  }
}
