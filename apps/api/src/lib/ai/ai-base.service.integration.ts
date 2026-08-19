// integration
import { apiEnv } from "@api/env/server";
import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { UserEntity } from "@api/database/entities/user.entity";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, beforeEach, vitest } from "vitest";
import { GraphQLError } from "graphql";
import type OpenAI from "openai";
import { z } from "zod";

import { buildDataSourceOptions } from "@api/database/data-source-options";
import { EncryptedColumnTransformer } from "@api/lib/crypto/encrypted-column.transformer";
import { SettingsEventBus } from "@api/domains/settings/settings-event.bus";
import { AiAccessService } from "./ai-access.service";
import { AiBaseService } from "./ai-base.service";
import { OpenAIClient } from "./openai.client";
import { PromptRendererService } from "./prompt-renderer.service";
import { AI_ERROR_CODES } from "./ai-errors.constants";

const hasDb = !!apiEnv.DATABASE_INTEGRATION_URL;

describe.skipIf(!hasDb)("AiBaseService (integration) — gating enforcement", () => {
  let dataSource: DataSource;
  let aiAccessService: AiAccessService;
  let aiBaseService: AiBaseService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;

  const testUserId = "ai-base-test-user-" + Date.now();
  const schema = z.object({ result: z.string() });

  beforeAll(async () => {
    dataSource = new DataSource(buildDataSourceOptions(apiEnv.DATABASE_INTEGRATION_URL!));
    await dataSource.initialize();

    aiAccessService = new AiAccessService(dataSource.getRepository(UserSettingEntity), new SettingsEventBus());
    openAIClient = new OpenAIClient();
    promptRenderer = {} as PromptRendererService;
    aiBaseService = new AiBaseService(openAIClient, promptRenderer, aiAccessService);

    const userRepo = dataSource.getRepository(UserEntity);
    const settingsRepo = dataSource.getRepository(UserSettingEntity);

    await userRepo.save({
      id: testUserId,
      email: `${testUserId}@example.com`,
      name: "AI Base Test User",
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
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe("gating before OpenAI call", () => {
    it("should reject when AI is disabled by user toggle", async () => {
      // Arrange: disable AI for the user
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      await settingsRepo.update({ userId: testUserId }, { aiEnabled: false });

      // Act & Assert: callAi should reject with the gating error, not attempt OpenAI call
      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      const error = await aiBaseService.callAi(opts).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).extensions.code).toBe(AI_ERROR_CODES.AI_DISABLED_BY_USER);
    });

    it("should reject when quota is exhausted and no personal key", async () => {
      // Arrange: reset the user to a fresh state
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      await settingsRepo.update(
        { userId: testUserId },
        { aiEnabled: true, openaiApiKeyEncrypted: null, trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT },
      );

      // Act & Assert
      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      const error = await aiBaseService.callAi(opts).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).extensions.code).toBe(AI_ERROR_CODES.AI_KEY_REQUIRED);
    });

    it("should not attempt OpenAI call when gating denies access", async () => {
      // Arrange: disable AI
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      await settingsRepo.update({ userId: testUserId }, { aiEnabled: false });

      // Mock OpenAIClient.getClientFor to throw if called (should not be called)
      const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
      getClientForSpy.mockImplementation(() => {
        throw new Error("getClientFor should not be called when gating rejects");
      });

      // Act & Assert: gating error propagates, getClientFor never called
      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      await expect(aiBaseService.callAi(opts)).rejects.toThrow(GraphQLError);
      expect(getClientForSpy).not.toHaveBeenCalled();

      getClientForSpy.mockRestore();
    });

    it("should pass gating when AI is enabled and quota available", async () => {
      // Arrange: ensure AI is enabled and quota available
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      await settingsRepo.update(
        { userId: testUserId },
        { aiEnabled: true, openaiApiKeyEncrypted: null, trialCallsUsed: 0 },
      );

      // Mock getClientFor to return a mock client
      const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
      getClientForSpy.mockReturnValue({
        chat: {
          completions: {
            parse: vitest
              .fn()
              .mockResolvedValue({ choices: [{ message: { parsed: { result: "test" }, refusal: null } }] }),
          },
        },
      } as unknown as OpenAI);

      // Act
      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      // Should not throw
      await expect(aiBaseService.callAi(opts)).resolves.toEqual({ result: "test" });

      // Verify gating passed and client was used
      expect(getClientForSpy).toHaveBeenCalled();

      getClientForSpy.mockRestore();
    });

    it("should use personal key if available, skipping trial quota check", async () => {
      // Arrange: set personal key (encrypted)
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      const encryption = new EncryptedColumnTransformer();

      // For this test, we'd need a real OpenAI key, which we don't have
      // So we'll verify the key resolution path differently
      const personalKeyPlaintext = "sk-test-personal-key-12345";
      const encrypted = encryption.to(personalKeyPlaintext);

      await settingsRepo.update(
        { userId: testUserId },
        {
          aiEnabled: true,
          openaiApiKeyEncrypted: encrypted,
          trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT, // Quota exhausted
        },
      );

      // Mock getClientFor to capture the key used
      const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
      getClientForSpy.mockReturnValue({
        chat: {
          completions: {
            parse: vitest
              .fn()
              .mockResolvedValue({ choices: [{ message: { parsed: { result: "test" }, refusal: null } }] }),
          },
        },
      } as unknown as OpenAI);

      // Act
      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      await expect(aiBaseService.callAi(opts)).resolves.toEqual({ result: "test" });

      // Verify personal key was used (not system key)
      expect(getClientForSpy).toHaveBeenCalledWith(personalKeyPlaintext);

      getClientForSpy.mockRestore();
    });
  });

  describe("response format behavior unchanged", () => {
    beforeEach(async () => {
      // Reset user to valid state for each test
      const settingsRepo = dataSource.getRepository(UserSettingEntity);
      await settingsRepo.update(
        { userId: testUserId },
        { aiEnabled: true, openaiApiKeyEncrypted: null, trialCallsUsed: 0 },
      );
    });

    it("should handle zod-response format with gating", async () => {
      const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
      getClientForSpy.mockReturnValue({
        chat: {
          completions: {
            parse: vitest
              .fn()
              .mockResolvedValue({ choices: [{ message: { parsed: { result: "zod-success" }, refusal: null } }] }),
          },
        },
      } as unknown as OpenAI);

      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "zod-response" as const,
        schema,
      };

      const result = await aiBaseService.callAi(opts);
      expect(result).toEqual({ result: "zod-success" });

      getClientForSpy.mockRestore();
    });

    it("should handle json-schema format with gating", async () => {
      const schemaJson = { type: "object", properties: { data: { type: "string" } } };
      const getClientForSpy = vitest.spyOn(openAIClient, "getClientFor");
      getClientForSpy.mockReturnValue({
        responses: { create: vitest.fn().mockResolvedValue({ output_text: JSON.stringify({ data: "json-success" }) }) },
      } as unknown as OpenAI);

      const opts = {
        userId: testUserId,
        systemMessage: "System",
        userMessage: "User",
        responseFormat: "json-schema" as const,
        schemaJson,
      };

      const result = await aiBaseService.callAi(opts);
      expect(result).toEqual({ data: "json-success" });

      getClientForSpy.mockRestore();
    });
  });
});
