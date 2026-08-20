import type { SettingsService } from "@api/domains/settings/settings.service";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AiUsageRepository } from "./ai-usage.repository";
import { AiUsageService } from "./ai-usage.service";
import { AiUsageSourceEnum } from "./ai-usage-source.enum";

describe("AiUsageService", () => {
  const repository = { record: vi.fn(), aggregateSince: vi.fn() };
  const settingsService = { getSettings: vi.fn() };
  let service: AiUsageService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T12:00:00.000Z"));
    vi.resetAllMocks();
    settingsService.getSettings.mockResolvedValue({ trialCallsUsed: 8, trialCallsLimit: 50 });
    service = new AiUsageService(
      repository as unknown as AiUsageRepository,
      settingsService as unknown as SettingsService,
    );
  });

  afterEach(() => vi.useRealTimers());

  it("separates source aggregates, preserves call totals, and requests the inclusive 30-day window", async () => {
    repository.aggregateSince.mockResolvedValue([
      { source: AiUsageSourceEnum.PersonalKey, inputTokens: 100, outputTokens: 40, totalTokens: 140, calls: 2 },
      { source: AiUsageSourceEnum.Trial, inputTokens: 25, outputTokens: 15, totalTokens: 40, calls: 1 },
    ]);

    await expect(service.getSummary("user-1")).resolves.toEqual({
      personalKey: { inputTokens: 100, outputTokens: 40, totalTokens: 140, calls: 2 },
      trial: { inputTokens: 25, outputTokens: 15, totalTokens: 40, calls: 1 },
      trialCallsUsed: 8,
      trialCallsLimit: 50,
    });
    expect(repository.aggregateSince).toHaveBeenCalledWith("user-1", new Date("2026-07-21T12:00:00.000Z"));
  });

  it("returns zero-valued totals when the rolling window has no records", async () => {
    repository.aggregateSince.mockResolvedValue([]);

    await expect(service.getSummary("user-1")).resolves.toEqual({
      personalKey: { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 },
      trial: { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 },
      trialCallsUsed: 8,
      trialCallsLimit: 50,
    });
  });

  it("delegates measured usage without adding provider data", async () => {
    repository.record.mockResolvedValue(undefined);
    const usage = { inputTokens: 3, outputTokens: 4, totalTokens: 7 };

    await service.record("user-1", AiUsageSourceEnum.Trial, usage);

    expect(repository.record).toHaveBeenCalledWith("user-1", AiUsageSourceEnum.Trial, usage);
  });
});
