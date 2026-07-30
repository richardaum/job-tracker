import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { DataSource } from "typeorm";
import { getMetadataArgsStorage, DataSource as TypeOrmDataSource, Repository } from "typeorm";
import { UserSettingEntity } from "./user-setting.entity";
import { buildDataSourceOptions } from "@api/database/data-source-options";
import { apiEnv } from "@api/env/server";
import { insertUserWithAuthAccount } from "@api/database/integration-test-user";

describe("UserSettingEntity", () => {
  function getColumnMetadata(propertyName: string) {
    const metadata = getMetadataArgsStorage().columns;
    return metadata.find((col) => col.target === UserSettingEntity && col.propertyName === propertyName);
  }

  it("aiEnabled column has default true", () => {
    const metadata = getColumnMetadata("aiEnabled");
    expect(metadata?.options.default).toBe(true);
  });

  it("openaiApiKeyEncrypted column is nullable", () => {
    const metadata = getColumnMetadata("openaiApiKeyEncrypted");
    expect(metadata?.options.nullable).toBe(true);
  });

  it("trialCallsUsed column has default 0", () => {
    const metadata = getColumnMetadata("trialCallsUsed");
    expect(metadata?.options.default).toBe(0);
  });

  it("allows setting aiEnabled to false", () => {
    const entity = new UserSettingEntity();
    entity.userId = "user-1";
    entity.aiEnabled = false;

    expect(entity.aiEnabled).toBe(false);
  });

  it("allows setting openai_api_key_encrypted to a value", () => {
    const entity = new UserSettingEntity();
    entity.userId = "user-1";
    entity.openaiApiKeyEncrypted = "encrypted-key-value";

    expect(entity.openaiApiKeyEncrypted).toBe("encrypted-key-value");
  });

  it("allows incrementing trial_calls_used", () => {
    const entity = new UserSettingEntity();
    entity.userId = "user-1";
    entity.trialCallsUsed = 5;

    expect(entity.trialCallsUsed).toBe(5);
  });

  it("allows all three fields to be set together", () => {
    const entity = new UserSettingEntity();
    entity.userId = "user-1";
    entity.aiEnabled = false;
    entity.openaiApiKeyEncrypted = "test-key";
    entity.trialCallsUsed = 10;

    expect(entity.aiEnabled).toBe(false);
    expect(entity.openaiApiKeyEncrypted).toBe("test-key");
    expect(entity.trialCallsUsed).toBe(10);
  });

  it("openaiApiKeyEncrypted column has EncryptedColumnTransformer", () => {
    const metadata = getColumnMetadata("openaiApiKeyEncrypted");
    expect(metadata?.options.transformer).toBeDefined();
  });
});

describe("UserSettingEntity with EncryptedColumnTransformer (Integration)", () => {
  let ds: DataSource;
  let userSettingRepository: Repository<UserSettingEntity>;

  beforeEach(async () => {
    const dbUrl = apiEnv.DATABASE_INTEGRATION_URL || apiEnv.DATABASE_URL;
    ds = new TypeOrmDataSource({
      ...buildDataSourceOptions(dbUrl, { ssl: apiEnv.DATABASE_SSL_ENABLED }),
      migrationsRun: true,
    });

    await ds.initialize();
    userSettingRepository = ds.getRepository(UserSettingEntity);
  });

  afterEach(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  });

  it("encrypts openaiApiKeyEncrypted when saving to database", async () => {
    const user = await insertUserWithAuthAccount(ds, {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      providerAccountId: `google-${Date.now()}`,
    });

    const plainKey = "sk-test-123456789";
    const setting = userSettingRepository.create({
      userId: user.id,
      openaiApiKeyEncrypted: plainKey,
      aiEnabled: true,
      trialCallsUsed: 0,
    });

    await userSettingRepository.save(setting);

    const queryRunner = ds.createQueryRunner();
    try {
      const rawResult = await queryRunner.query(
        `SELECT openai_api_key_encrypted FROM user_settings WHERE user_id = $1`,
        [user.id],
      );

      expect(rawResult).toHaveLength(1);
      const storedValue = rawResult[0].openai_api_key_encrypted;

      expect(storedValue).not.toBe(plainKey);
      expect(storedValue).toBeDefined();
      expect(() => Buffer.from(storedValue, "base64")).not.toThrow();
    } finally {
      await queryRunner.release();
    }
  });

  it("decrypts openaiApiKeyEncrypted when loading from database", async () => {
    const user = await insertUserWithAuthAccount(ds, {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      providerAccountId: `google-${Date.now()}`,
    });

    const plainKey = "sk-test-123456789";
    const setting = userSettingRepository.create({
      userId: user.id,
      openaiApiKeyEncrypted: plainKey,
      aiEnabled: true,
      trialCallsUsed: 0,
    });

    await userSettingRepository.save(setting);

    const loadedSetting = await userSettingRepository.findOne({ where: { userId: user.id } });

    expect(loadedSetting).toBeDefined();
    expect(loadedSetting?.openaiApiKeyEncrypted).toBe(plainKey);
  });

  it("entity with encrypted key round-trips through database unchanged", async () => {
    const user = await insertUserWithAuthAccount(ds, {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      providerAccountId: `google-${Date.now()}`,
    });

    const plainKey = "sk-test-123456789";
    const originalSetting = userSettingRepository.create({
      userId: user.id,
      openaiApiKeyEncrypted: plainKey,
      aiEnabled: true,
      trialCallsUsed: 0,
    });

    await userSettingRepository.save(originalSetting);

    const loadedSetting = await userSettingRepository.findOne({ where: { userId: user.id } });

    expect(loadedSetting?.openaiApiKeyEncrypted).toBe(plainKey);
    expect(loadedSetting?.aiEnabled).toBe(true);
    expect(loadedSetting?.trialCallsUsed).toBe(0);
  });

  it("null key remains null through save/load cycle", async () => {
    const user = await insertUserWithAuthAccount(ds, {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      providerAccountId: `google-${Date.now()}`,
    });

    const setting = userSettingRepository.create({
      userId: user.id,
      openaiApiKeyEncrypted: null,
      aiEnabled: true,
      trialCallsUsed: 0,
    });

    await userSettingRepository.save(setting);

    const loadedSetting = await userSettingRepository.findOne({ where: { userId: user.id } });

    expect(loadedSetting?.openaiApiKeyEncrypted).toBeNull();
  });
});
