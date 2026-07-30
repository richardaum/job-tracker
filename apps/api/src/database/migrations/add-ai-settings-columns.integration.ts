import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DataSource } from "typeorm";
import { DataSource as TypeOrmDataSource } from "typeorm";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { apiEnv } from "@api/env/server";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";

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
    // Get the column info after running all migrations
    const queryRunner = ds.createQueryRunner();
    try {
      const table = await queryRunner.getTable("user_settings");
      const aiEnabledColumn = table?.columns.find((col) => col.name === "ai_enabled");

      expect(aiEnabledColumn).toBeDefined();
      expect(aiEnabledColumn?.type).toBe("boolean");
      expect(aiEnabledColumn?.isNullable).toBe(false);
      // Default is stored as a string in metadata
      expect(aiEnabledColumn?.default === true || aiEnabledColumn?.default === "true").toBe(true);
    } finally {
      await queryRunner.release();
    }
  });

  it("migration adds openai_api_key_encrypted column with correct type and nullable", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const table = await queryRunner.getTable("user_settings");
      const keyColumn = table?.columns.find((col) => col.name === "openai_api_key_encrypted");

      expect(keyColumn).toBeDefined();
      expect(keyColumn?.type).toBe("text");
      expect(keyColumn?.isNullable).toBe(true);
    } finally {
      await queryRunner.release();
    }
  });

  it("migration adds trial_calls_used column with correct type and default", async () => {
    const queryRunner = ds.createQueryRunner();
    try {
      const table = await queryRunner.getTable("user_settings");
      const trialColumn = table?.columns.find((col) => col.name === "trial_calls_used");

      expect(trialColumn).toBeDefined();
      expect(trialColumn?.type).toBe("integer");
      expect(trialColumn?.isNullable).toBe(false);
      // Default is stored as a string in metadata, so check for the numeric value or string representation
      expect(trialColumn?.default === 0 || trialColumn?.default === "0" || trialColumn?.default === "'0'").toBe(true);
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
      // Get table before down
      let table = await queryRunner.getTable("user_settings");
      let hasAiEnabled = table?.columns.some((col) => col.name === "ai_enabled");
      let hasKeyColumn = table?.columns.some((col) => col.name === "openai_api_key_encrypted");
      let hasTrialColumn = table?.columns.some((col) => col.name === "trial_calls_used");

      // Verify columns exist before down
      expect(hasAiEnabled).toBe(true);
      expect(hasKeyColumn).toBe(true);
      expect(hasTrialColumn).toBe(true);

      // Run down migration
      await migration.down(queryRunner);

      // Get table after down
      table = await queryRunner.getTable("user_settings");
      hasAiEnabled = table?.columns.some((col) => col.name === "ai_enabled");
      hasKeyColumn = table?.columns.some((col) => col.name === "openai_api_key_encrypted");
      hasTrialColumn = table?.columns.some((col) => col.name === "trial_calls_used");

      // Verify columns are removed
      expect(hasAiEnabled).toBe(false);
      expect(hasKeyColumn).toBe(false);
      expect(hasTrialColumn).toBe(false);

      // Run up migration again
      await migration.up(queryRunner);

      // Verify columns exist again
      table = await queryRunner.getTable("user_settings");
      hasAiEnabled = table?.columns.some((col) => col.name === "ai_enabled");
      hasKeyColumn = table?.columns.some((col) => col.name === "openai_api_key_encrypted");
      hasTrialColumn = table?.columns.some((col) => col.name === "trial_calls_used");

      expect(hasAiEnabled).toBe(true);
      expect(hasKeyColumn).toBe(true);
      expect(hasTrialColumn).toBe(true);
    } finally {
      await queryRunner.release();
    }
  });
});
