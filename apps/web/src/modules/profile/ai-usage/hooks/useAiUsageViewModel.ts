"use client";

import { tryRun } from "@job-tracker/try-run";

import type { AiUsageQuery } from "@/gql/graphql";
import { useAiUsageQuery } from "@/gql/hooks";

export type AiUsageTotals = AiUsageQuery["aiUsage"]["personalKey"];

const EMPTY_TOTALS: AiUsageTotals = { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 };

export function useAiUsageViewModel() {
  const { data, loading, error, refetch } = useAiUsageQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const summary = data?.aiUsage;

  async function refresh() {
    await tryRun(refetch());
  }

  return {
    personalKey: summary?.personalKey ?? EMPTY_TOTALS,
    trial: summary?.trial ?? EMPTY_TOTALS,
    hasOpenAiKey: data?.settings.hasOpenAiKey ?? false,
    trialCallsUsed: summary?.trialCallsUsed ?? 0,
    trialCallsLimit: summary?.trialCallsLimit ?? 0,
    trialCallsRemaining: Math.max((summary?.trialCallsLimit ?? 0) - (summary?.trialCallsUsed ?? 0), 0),
    showInitialLoading: loading && !data,
    refreshing: loading && Boolean(data),
    unavailable: Boolean(error) && !data,
    hasStaleData: Boolean(error) && Boolean(data),
    refresh,
  };
}

export function hasUsage(totals: AiUsageTotals): boolean {
  return totals.totalTokens > 0 || totals.inputTokens > 0 || totals.outputTokens > 0 || totals.calls > 0;
}
