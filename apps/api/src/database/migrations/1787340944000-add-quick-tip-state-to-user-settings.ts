import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuickTipStateToUserSettings1787340944000 implements MigrationInterface {
  name = "AddQuickTipStateToUserSettings1787340944000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN last_quick_tip_id text`);
    await queryRunner.query(
      `ALTER TABLE user_settings ADD COLUMN dismissed_quick_tip_ids text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN dismissed_quick_tip_ids`);
    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN last_quick_tip_id`);
  }
}
