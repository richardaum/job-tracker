import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GraphQLError } from "graphql";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { apiEnv } from "@api/env/server";
import { SettingsEventBus } from "@api/domains/settings/settings-event.bus";
import { AiAccessService } from "./ai-access.service";
import { AI_ERROR_CODES } from "./ai-errors.constants";

describe("AiAccessService", () => {
  let service: AiAccessService;
  let mockSettingsRepo: Record<"findOneByOrFail" | "createQueryBuilder", ReturnType<typeof vi.fn>>;
  let mockEventBus: { emit: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockSettingsRepo = { findOneByOrFail: vi.fn(), createQueryBuilder: vi.fn() };

    mockEventBus = { emit: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAccessService,
        { provide: getRepositoryToken(UserSettingEntity), useValue: mockSettingsRepo },
        { provide: SettingsEventBus, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<AiAccessService>(AiAccessService);
  });

  describe("resolveClientKey", () => {
    const userId = "test-user-123";

    describe("toggle off → AI_DISABLED_BY_USER", () => {
      it("throws AI_DISABLED_BY_USER when aiEnabled is false", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: false,
          openaiApiKeyEncrypted: null,
          trialCallsUsed: 0,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        await expect(service.resolveClientKey(userId)).rejects.toThrow(GraphQLError);

        try {
          await service.resolveClientKey(userId);
        } catch (err) {
          if (err instanceof GraphQLError) {
            expect(err.extensions.code).toBe(AI_ERROR_CODES.AI_DISABLED_BY_USER);
          }
        }
      });

      it("throws AI_DISABLED_BY_USER even if personal key is set", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: false,
          openaiApiKeyEncrypted: "encrypted-key-value",
          trialCallsUsed: 0,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        try {
          await service.resolveClientKey(userId);
        } catch (err) {
          if (err instanceof GraphQLError) {
            expect(err.extensions.code).toBe(AI_ERROR_CODES.AI_DISABLED_BY_USER);
          }
        }
      });
    });

    describe("personal key path → returns decrypted key, no quota mutation", () => {
      it("returns the personal key already decrypted by TypeORM, without modifying quota", async () => {
        const decryptedKey = "sk-12345-actual-key";

        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: true,
          openaiApiKeyEncrypted: decryptedKey,
          trialCallsUsed: 10,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        const key = await service.resolveClientKey(userId);

        expect(key).toBe(decryptedKey);
        // Verify no database update was performed
        expect(mockSettingsRepo.createQueryBuilder).not.toHaveBeenCalled();
      });

      it("returns personal key even if trial quota is exhausted", async () => {
        const decryptedKey = "sk-12345-actual-key";

        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: true,
          openaiApiKeyEncrypted: decryptedKey,
          trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        const key = await service.resolveClientKey(userId);

        expect(key).toBe(decryptedKey);
      });
    });

    describe("trial quota path → atomic increment and system key", () => {
      it("increments trial_calls_used and returns system key when quota remains", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: true,
          openaiApiKeyEncrypted: null,
          trialCallsUsed: 10,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        const mockQueryBuilder = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue({ affected: 1 }),
        };

        mockSettingsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const key = await service.resolveClientKey(userId);

        expect(key).toBe(apiEnv.OPENAI_API_KEY);
        expect(mockSettingsRepo.createQueryBuilder).toHaveBeenCalled();
        expect(mockQueryBuilder.update).toHaveBeenCalledWith(UserSettingEntity);
        expect(mockQueryBuilder.set).toHaveBeenCalledWith({ trialCallsUsed: expect.any(Function) });
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "user_id = :userId AND trial_calls_used < trial_calls_limit",
          { userId },
        );
      });

      it("throws AI_KEY_REQUIRED when quota exhausted (affected = 0)", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: true,
          openaiApiKeyEncrypted: null,
          trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        const mockQueryBuilder = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue({ affected: 0 }),
        };

        mockSettingsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        try {
          await service.resolveClientKey(userId);
        } catch (err) {
          if (err instanceof GraphQLError) {
            expect(err.extensions.code).toBe(AI_ERROR_CODES.AI_KEY_REQUIRED);
          }
        }
      });

      it("does not increment beyond limit due to atomic WHERE clause", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: true,
          openaiApiKeyEncrypted: null,
          trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT - 1,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        const mockQueryBuilder = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue({ affected: 1 }),
        };

        mockSettingsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        const key = await service.resolveClientKey(userId);

        expect(key).toBe(apiEnv.OPENAI_API_KEY);
        // The WHERE clause should protect against going beyond the limit
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          "user_id = :userId AND trial_calls_used < trial_calls_limit",
          { userId },
        );
      });
    });

    describe("error handling", () => {
      it("throws when user setting is not found", async () => {
        mockSettingsRepo.findOneByOrFail.mockRejectedValue(new Error("User setting not found"));

        await expect(service.resolveClientKey(userId)).rejects.toThrow();
      });

      it("throws GraphQLError with correct extension code structure", async () => {
        mockSettingsRepo.findOneByOrFail.mockResolvedValue({
          userId,
          aiEnabled: false,
          openaiApiKeyEncrypted: null,
          trialCallsUsed: 0,
          trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
        });

        try {
          await service.resolveClientKey(userId);
        } catch (err) {
          expect(err).toBeInstanceOf(GraphQLError);
          if (err instanceof GraphQLError) {
            expect(err.extensions).toBeDefined();
            expect(err.extensions.code).toBe(AI_ERROR_CODES.AI_DISABLED_BY_USER);
          }
        }
      });
    });
  });

  describe("checkAccess", () => {
    const userId = "test-user-123";

    it("throws AI_DISABLED_BY_USER when aiEnabled is false, without decrypting or querying quota", async () => {
      mockSettingsRepo.findOneByOrFail.mockResolvedValue({
        userId,
        aiEnabled: false,
        openaiApiKeyEncrypted: "encrypted-key-value",
        trialCallsUsed: 0,
        trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      });

      await expect(service.checkAccess(userId)).rejects.toThrow(GraphQLError);
      expect(mockSettingsRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it("resolves without side effects when a personal key is set", async () => {
      mockSettingsRepo.findOneByOrFail.mockResolvedValue({
        userId,
        aiEnabled: true,
        openaiApiKeyEncrypted: "encrypted-key-value",
        trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT,
        trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      });

      await expect(service.checkAccess(userId)).resolves.toBeUndefined();
      expect(mockSettingsRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it("resolves without incrementing quota when trial calls remain", async () => {
      mockSettingsRepo.findOneByOrFail.mockResolvedValue({
        userId,
        aiEnabled: true,
        openaiApiKeyEncrypted: null,
        trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT - 1,
        trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      });

      await expect(service.checkAccess(userId)).resolves.toBeUndefined();
      expect(mockSettingsRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it("throws AI_KEY_REQUIRED when trial quota is exhausted and no personal key", async () => {
      mockSettingsRepo.findOneByOrFail.mockResolvedValue({
        userId,
        aiEnabled: true,
        openaiApiKeyEncrypted: null,
        trialCallsUsed: apiEnv.TRIAL_AI_CALL_LIMIT,
        trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      });

      try {
        await service.checkAccess(userId);
        expect.unreachable("checkAccess should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(GraphQLError);
        if (err instanceof GraphQLError) {
          expect(err.extensions.code).toBe(AI_ERROR_CODES.AI_KEY_REQUIRED);
        }
      }
    });
  });
});
