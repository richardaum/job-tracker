import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DataSource, QueryRunner } from "typeorm";
import { DataSource as TypeOrmDataSource } from "typeorm";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { apiEnv } from "@api/env/server";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";

type UserSettingsColumn = { data_type: string; is_nullable: "YES" | "NO"; column_default: string | null };

const AI_SETTINGS_COLUMN_NAMES = ["ai_enabled", "openai_api_key_encrypted", "trial_calls_used"];

describe("Migration: AddAiSettingsColumns", () => {
  let ds: DataSource;

  beforeEach(async () => {
    const dbUrl = apiEnv.DATABASE_INTEGRATION_URL || apiEnv.DATABASE_URL;
    ds = new TypeOrmDataSource({
      ...buildDataSourceOptions(dbUrl, { ssl: apiEnv.DATABASE_SSL_ENABLED }),
      migrationsRun: true,
    });

    await ds.initialize();
  });

  afterEach(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  });

  it("migration adds ai_enabled column with correct type and default", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const aiEnabledColumn = await findUserSettingsColumn(queryRunner, "ai_enabled");

      expect(aiEnabledColumn).toBeDefined();
      expect(aiEnabledColumn?.data_type).toBe("boolean");
      expect(aiEnabledColumn?.is_nullable).toBe("NO");
      expect(aiEnabledColumn?.column_default).toMatch(/true/i);
    } finally {
      await queryRunner.release();
    }
  });

  it("migration adds openai_api_key_encrypted column with correct type and nullable", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const keyColumn = await findUserSettingsColumn(queryRunner, "openai_api_key_encrypted");

      expect(keyColumn).toBeDefined();
      expect(keyColumn?.data_type).toBe("text");
      expect(keyColumn?.is_nullable).toBe("YES");
    } finally {
      await queryRunner.release();
    }
  });

  it("migration adds trial_calls_used column with correct type and default", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const trialColumn = await findUserSettingsColumn(queryRunner, "trial_calls_used");

      expect(trialColumn).toBeDefined();
      expect(trialColumn?.data_type).toBe("integer");
      expect(trialColumn?.is_nullable).toBe("NO");
      expect(trialColumn?.column_default).toMatch(/0/);
    } finally {
      await queryRunner.release();
    }
  });

  it("existing user_settings row reads correct defaults after migration", async () => {
    // Insert a user first with unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const user = await insertUserWithAuthAccount(ds, {
      email: uniqueEmail,
      name: "Test User",
      providerAccountId: `google-${Date.now()}`,
    });

    // The insertUserWithAuthAccount doesn't create settings, so manually create one
    const queryRunner = ds.createQueryRunner();
    try {
      // Insert user_settings if it doesn't exist
      await queryRunner.query(`INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [user.id]);

      // Verify that the user_settings row has correct defaults
      const result = await queryRunner.query(
        `SELECT ai_enabled, trial_calls_used, openai_api_key_encrypted FROM user_settings WHERE user_id = $1`,
        [user.id],
      );

      expect(result).toHaveLength(1);
      expect(result[0].ai_enabled).toBe(true);
      expect(result[0].trial_calls_used).toBe(0);
      expect(result[0].openai_api_key_encrypted).toBeNull();
    } finally {
      await queryRunner.release();
    }
  });

  it("migration can be reversed via down method", async () => {
    const AddAiSettingsColumns1785420033000 = (await import("./1785420033000-add-ai-settings-columns"))
      .AddAiSettingsColumns1785420033000;
    const migration = new AddAiSettingsColumns1785420033000();
    const queryRunner = ds.createQueryRunner();

    try {
      for (const columnName of AI_SETTINGS_COLUMN_NAMES) {
        expect(await findUserSettingsColumn(queryRunner, columnName)).toBeDefined();
      }

      await migration.down(queryRunner);

      for (const columnName of AI_SETTINGS_COLUMN_NAMES) {
        expect(await findUserSettingsColumn(queryRunner, columnName)).toBeUndefined();
      }

      await migration.up(queryRunner);

      for (const columnName of AI_SETTINGS_COLUMN_NAMES) {
        expect(await findUserSettingsColumn(queryRunner, columnName)).toBeDefined();
      }
    } finally {
      await queryRunner.release();
    }
  });
});

async function findUserSettingsColumn(queryRunner: QueryRunner, columnName: string) {
  const [column]: UserSettingsColumn[] = await queryRunner.query(
    `SELECT data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = current_schema()
       AND table_name = 'user_settings'
       AND column_name = $1`,
    [columnName],
  );

  return column;
}
