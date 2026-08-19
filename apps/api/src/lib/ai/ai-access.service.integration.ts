// integration
import { apiEnv } from "@api/env/server";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { SettingsEventBus } from "@api/domains/settings/settings-event.bus";
import { AiAccessService } from "./ai-access.service";
import { AI_ERROR_CODES } from "./ai-errors.constants";
import { GraphQLError } from "graphql";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe("AiAccessService (integration) — concurrent quota consumption", () => {
  let dataSource: DataSource;
  let service: AiAccessService;
  const testUserId = "concurrent-test-user-" + Date.now();

  beforeAll(async () => {
    if (!hasDb) return;

    dataSource = new DataSource(buildDataSourceOptions(apiEnv.DATABASE_INTEGRATION_URL!));
    await dataSource.initialize();

    service = new AiAccessService(dataSource.getRepository(UserSettingEntity), new SettingsEventBus());

    const userRepo = dataSource.getRepository(UserEntity);
    const settingsRepo = dataSource.getRepository(UserSettingEntity);

    await userRepo.save({
      id: testUserId,
      email: `${testUserId}@example.com`,
      name: "Concurrent Test User",
      googleId: testUserId,
    });

    await settingsRepo.save({
      userId: testUserId,
      aiEnabled: true,
      openaiApiKeyEncrypted: null,
      trialCallsUsed: 0,
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });
  });

  afterAll(async () => {
    if (!hasDb) return;

    const userRepo = dataSource.getRepository(UserEntity);
    await userRepo.delete({ id: testUserId });
    await dataSource.destroy();
  });

  it.skipIf(!hasDb)(
    "60 concurrent calls with limit=50 result in 50 successes and 10 failures, no overcount",
    async () => {
      const trialLimit = apiEnv.TRIAL_AI_CALL_LIMIT;
      const concurrentCalls = 60;
      const expectedSuccesses = Math.min(concurrentCalls, trialLimit);
      const expectedFailures = concurrentCalls - expectedSuccesses;

      const promises = Array.from({ length: concurrentCalls }).map(() =>
        service
          .resolveClientKey(testUserId)
          .then(() => ({ type: "success" }))
          .catch((err) => ({ type: "failure", code: err instanceof GraphQLError ? err.extensions.code : null })),
      );

      const results = await Promise.all(promises);

      const successes = results.filter((r) => r.type === "success");
      const failures = results.filter((r) => r.type === "failure");
      const keyRequiredFailures = failures.filter((r) => "code" in r && r.code === AI_ERROR_CODES.AI_KEY_REQUIRED);

      expect(successes).toHaveLength(expectedSuccesses);
      expect(failures).toHaveLength(expectedFailures);
      expect(keyRequiredFailures).toHaveLength(expectedFailures);

      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      const finalSetting = await settingsRepo.findOneByOrFail({ userId: testUserId });

      expect(finalSetting.trialCallsUsed).toBe(expectedSuccesses);
    },
  );

  it.skipIf(!hasDb)("a failed downstream call does not require quota refund on retry", async () => {
    const settingsRepo = dataSource.getRepository(UserSettingEntity);
    const testUser2 = "quota-refund-test-" + Date.now();

    const userRepo = dataSource.getRepository(UserEntity);
    await userRepo.save({
      id: testUser2,
      email: `${testUser2}@example.com`,
      name: "Quota Refund Test User",
      googleId: testUser2,
    });

    await settingsRepo.save({
      userId: testUser2,
      aiEnabled: true,
      openaiApiKeyEncrypted: null,
      trialCallsUsed: 0,
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    try {
      // First call consumes quota
      const key1 = await service.resolveClientKey(testUser2);
      expect(key1).toBeDefined();

      let setting = await settingsRepo.findOneByOrFail({ userId: testUser2 });
      expect(setting.trialCallsUsed).toBe(1);

      // Simulate a failed OpenAI call (e.g., network error)
      // The quota is already consumed, not refunded

      // Second call should also consume quota
      const key2 = await service.resolveClientKey(testUser2);
      expect(key2).toBeDefined();

      setting = await settingsRepo.findOneByOrFail({ userId: testUser2 });
      expect(setting.trialCallsUsed).toBe(2);
    } finally {
      await userRepo.delete({ id: testUser2 });
    }
  });
});
