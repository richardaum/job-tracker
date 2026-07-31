import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrialCallsLimitToUserSettings1785459600000 implements MigrationInterface {
  name = "AddTrialCallsLimitToUserSettings1785459600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN trial_calls_limit integer DEFAULT 50 NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN trial_calls_limit`);
  }
}
