import type { AiUsageSourceEnum } from "./ai-usage-source.enum";

export type AiTokenUsage = { inputTokens: number; outputTokens: number; totalTokens: number };

export type AiUsageAggregate = AiTokenUsage & { source: AiUsageSourceEnum; calls: number };

export type AiUsageTotals = AiTokenUsage & { calls: number };

export type AiUsageSummary = {
  personalKey: AiUsageTotals;
  trial: AiUsageTotals;
  trialCallsUsed: number;
  trialCallsLimit: number;
};
