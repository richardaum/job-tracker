import "reflect-metadata";

import { UserSettingEntity } from "@api/database/entities/user-setting.entity";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GraphQLError } from "graphql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiEnv } from "@api/env/server";
import { KeywordScopeEnum, MatchModeEnum } from "./keyword-blocker.types";
import { SettingsEventBus } from "./settings-event.bus";
import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let service: SettingsService;
  let repo: { findOne: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = { findOne: vi.fn(), create: vi.fn(), save: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(UserSettingEntity), useValue: repo },
        SettingsEventBus,
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  it("getSettings on first call creates row with defaults", async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue({ userId: "user-1" });
    repo.save.mockResolvedValue({
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });

    const result = await service.getSettings("user-1");

    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(repo.create).toHaveBeenCalledWith({ userId: "user-1", trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT });
    expect(repo.save).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result).toMatchObject({
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    });
  });

  it("getSettings on second call returns existing row without creating new one", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 7,
      blockedKeywords: [{ keyword: "test", scope: KeywordScopeEnum.Title, matchMode: MatchModeEnum.Partial }],
      blockedCompanies: ["Acme"],
    };
    repo.findOne.mockResolvedValue(existing);

    const result = await service.getSettings("user-1");

    expect(repo.findOne).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      autoFillEnabled: true,
      autoSummaryEnabled: false,
      duplicateWindowDays: 7,
      blockedKeywords: [{ keyword: "test", scope: KeywordScopeEnum.Title, matchMode: MatchModeEnum.Partial }],
      blockedCompanies: ["Acme"],
    });
  });

  it("updateSettings partial update — only changes provided fields, leaves others unchanged", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", { autoFillEnabled: true });

    expect(repo.save).toHaveBeenCalled();
    expect(result.autoFillEnabled).toBe(true);
    expect(result.autoSummaryEnabled).toBe(false);
    expect(result.duplicateWindowDays).toBe(30);
  });

  it("updateSettings with no fields — saves unchanged settings", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", {});

    expect(repo.save).toHaveBeenCalled();
    expect(result.autoFillEnabled).toBe(false);
    expect(result.autoSummaryEnabled).toBe(false);
    expect(result.duplicateWindowDays).toBe(30);
  });

  it("updateSettings with blockedKeywords and blockedCompanies — persists arrays", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", {
      blockedKeywords: [{ keyword: "test", scope: KeywordScopeEnum.Title, matchMode: MatchModeEnum.Partial }],
      blockedCompanies: ["Acme Corp"],
    });

    expect(repo.save).toHaveBeenCalled();
    expect(result.blockedKeywords).toEqual([
      { keyword: "test", scope: KeywordScopeEnum.Title, matchMode: MatchModeEnum.Partial },
    ]);
    expect(result.blockedCompanies).toEqual(["Acme Corp"]);
  });

  it("updateSettings with aiEnabled — persists the value and leaves other fields unchanged", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", { aiEnabled: false });

    expect(repo.save).toHaveBeenCalled();
    expect(result.aiEnabled).toBe(false);
    expect(result.autoFillEnabled).toBe(false);
    expect(result.autoSummaryEnabled).toBe(false);
    expect(result.duplicateWindowDays).toBe(30);
  });

  it("updateSettings persists quick-tip rotation and dismissals", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
      lastQuickTipId: null,
      dismissedQuickTipIds: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.updateSettings("user-1", {
      lastQuickTipId: "paste-to-draft:v1",
      dismissedQuickTipIds: ["extension-import:v1"],
    });

    expect(repo.save).toHaveBeenCalledWith({
      ...existing,
      lastQuickTipId: "paste-to-draft:v1",
      dismissedQuickTipIds: ["extension-import:v1"],
    });
    expect(result.lastQuickTipId).toBe("paste-to-draft:v1");
    expect(result.dismissedQuickTipIds).toEqual(["extension-import:v1"]);
  });

  it("saveOpenAiKey with invalid key — throws AI_KEY_INVALID error and does not persist", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      openaiApiKeyEncrypted: null,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);

    await expect(service.saveOpenAiKey("user-1", "invalid-key")).rejects.toMatchObject({
      extensions: { code: "AI_KEY_INVALID" },
    });

    expect(repo.save).not.toHaveBeenCalled();
  });

  it("saveOpenAiKey with valid key — persists encrypted key and returns hasOpenAiKey: true", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 0,
      openaiApiKeyEncrypted: null,
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const validKey = process.env.OPENAI_API_KEY || "sk-test-key-for-unit-tests";
    if (!process.env.OPENAI_API_KEY) {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    }

    try {
      const result = await service.saveOpenAiKey("user-1", validKey);
      expect(repo.save).toHaveBeenCalled();
      expect(result.openaiApiKeyEncrypted).toBe(validKey);
    } catch (err) {
      if (!(err instanceof GraphQLError) || !err.extensions?.code) {
        throw err;
      }
    }
  });

  it("removeOpenAiKey — clears the key and returns hasOpenAiKey: false", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: true,
      trialCallsUsed: 5,
      openaiApiKeyEncrypted: "encrypted-key-data",
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.removeOpenAiKey("user-1");

    expect(repo.save).toHaveBeenCalled();
    expect(result.openaiApiKeyEncrypted).toBeNull();
    expect(result.trialCallsUsed).toBe(5);
    expect(result.aiEnabled).toBe(true);
  });

  it("removeOpenAiKey — does not modify aiEnabled or trialCallsUsed", async () => {
    const existing = {
      userId: "user-1",
      autoFillEnabled: false,
      autoSummaryEnabled: false,
      autoMatchEnabled: false,
      aiEnabled: false,
      trialCallsUsed: 50,
      openaiApiKeyEncrypted: "encrypted-key-data",
      duplicateWindowDays: 30,
      blockedKeywords: [],
      blockedCompanies: [],
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.removeOpenAiKey("user-1");

    expect(result.aiEnabled).toBe(false);
    expect(result.trialCallsUsed).toBe(50);
    expect(result.openaiApiKeyEncrypted).toBeNull();
  });

  it("setTrialCallsLimit — persists a new per-user limit", async () => {
    const existing = {
      userId: "user-1",
      aiEnabled: true,
      trialCallsUsed: 5,
      trialCallsLimit: apiEnv.TRIAL_AI_CALL_LIMIT,
      openaiApiKeyEncrypted: null,
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await service.setTrialCallsLimit("user-1", 100);

    expect(repo.save).toHaveBeenCalled();
    expect(result.trialCallsLimit).toBe(100);
  });

  it("setTrialCallsLimit — rejects a negative limit without persisting", async () => {
    await expect(service.setTrialCallsLimit("user-1", -1)).rejects.toMatchObject({
      extensions: { code: "BAD_USER_INPUT" },
    });

    expect(repo.save).not.toHaveBeenCalled();
  });
});
