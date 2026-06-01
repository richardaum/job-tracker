import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserPreferencesToWorkPreferences1767600000000 implements MigrationInterface {
  name = "RenameUserPreferencesToWorkPreferences1767600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_preferences" RENAME TO "work_preferences"`);
    await this.safeRenameIndex(queryRunner, "uq_user_preferences_user_id", "uq_work_preferences_user_id");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "work_preferences" RENAME TO "user_preferences"`);
    await this.safeRenameIndex(queryRunner, "uq_work_preferences_user_id", "uq_user_preferences_user_id");
  }

  private async safeRenameIndex(queryRunner: QueryRunner, oldName: string, newName: string): Promise<void> {
    const rows: { name: string }[] = await queryRunner.query(
      `SELECT indexname AS name FROM pg_indexes WHERE indexname = $1`,
      [oldName],
    );
    if (rows.length > 0) {
      await queryRunner.query(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
    }
  }
}
