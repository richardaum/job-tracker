import type { MigrationInterface, QueryRunner } from "typeorm";

import { apiEnv } from "@api/env/server";

export class AddTrialCallsLimitToUserSettings1785459600000 implements MigrationInterface {
  name = "AddTrialCallsLimitToUserSettings1785459600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings ADD COLUMN trial_calls_limit integer DEFAULT 50 NOT NULL`);

    // Column default above only covers rows inserted without an explicit value.
    // Backfill pre-existing rows with the real configured limit instead of the hardcoded 50.
    await queryRunner.query(`UPDATE user_settings SET trial_calls_limit = $1`, [apiEnv.TRIAL_AI_CALL_LIMIT]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_settings DROP COLUMN trial_calls_limit`);
  }
}
