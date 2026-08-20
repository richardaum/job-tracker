import { SettingsService } from "@api/domains/settings/settings.service";
import { Injectable } from "@nestjs/common";

import { AiUsageRepository } from "./ai-usage.repository";
import type { AiTokenUsage, AiUsageSummary, AiUsageTotals } from "./ai-usage.schema";
import { AiUsageSourceEnum } from "./ai-usage-source.enum";

const ROLLING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function emptyTotals(): AiUsageTotals {
  return { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 };
}

@Injectable()
export class AiUsageService {
  constructor(
    private readonly repository: AiUsageRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async record(userId: string, source: AiUsageSourceEnum, usage: AiTokenUsage): Promise<void> {
    await this.repository.record(userId, source, usage);
  }

  async getSummary(userId: string): Promise<AiUsageSummary> {
    const since = new Date(Date.now() - ROLLING_WINDOW_MS);
    const [aggregates, settings] = await Promise.all([
      this.repository.aggregateSince(userId, since),
      this.settingsService.getSettings(userId),
    ]);
    const personalKey = emptyTotals();
    const trial = emptyTotals();

    for (const aggregate of aggregates) {
      const target = aggregate.source === AiUsageSourceEnum.PersonalKey ? personalKey : trial;
      target.inputTokens = aggregate.inputTokens;
      target.outputTokens = aggregate.outputTokens;
      target.totalTokens = aggregate.totalTokens;
      target.calls = aggregate.calls;
    }

    return { personalKey, trial, trialCallsUsed: settings.trialCallsUsed, trialCallsLimit: settings.trialCallsLimit };
  }
}
