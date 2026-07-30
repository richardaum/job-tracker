import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiSettingsColumns1785420033000 implements MigrationInterface {
  name = "AddAiSettingsColumns1785420033000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN ai_enabled boolean DEFAULT true NOT NULL`);

    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN openai_api_key_encrypted text`);

    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN trial_calls_used integer DEFAULT 0 NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN trial_calls_used`);

    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN openai_api_key_encrypted`);

    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN ai_enabled`);
  }
}
