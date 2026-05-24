"use client";

import { tryRun } from "@job-tracker/try-run";
import { useMemo, useState } from "react";

import {
  AsyncMetadataStatus,
  MatchVerdict,
  useGenerateJobMatchMutation,
  useJobMatchQuery,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

export type MatchTabFilterTab = "all" | MatchVerdict;

export function useMatchTabViewModel(jobId: string) {
  const { enqueueToast } = useToastQueue();

  const [wizardOpen, setWizardOpen] = useState(false);

  const [matchFilterTab, setMatchFilterTab] =
    useState<MatchTabFilterTab>("all");

  const {
    data: matchData,
    loading: matchLoading,
    error: matchError,
    refetch: refetchJobMatch,
  } = useJobMatchQuery({
    variables: { jobId },
    fetchPolicy: "cache-and-network",
  });

  const [generateJobMatch, { loading: generating }] =
    useGenerateJobMatchMutation();

  const matchAnalysis = matchData?.jobMatch ?? null;
  const matchPk = matchAnalysis?.id ?? null;
  const status = matchAnalysis?.generationMetadata?.status;

  const isProcessing = status === AsyncMetadataStatus.Processing;
  const isFailed = status === AsyncMetadataStatus.Failed;
  const isCompleted = status === AsyncMetadataStatus.Completed;

  /** True when toolbar should offer Regenerate vs Generate (parity with standalone page). */
  const hasRenderableMatchRecord =
    !!matchAnalysis && !isProcessing && !isFailed;

  const sseUrl =
    matchPk != null ? `${getApiBaseUrl()}/matches/${matchPk}/stream` : null;

  useEventSource<{ matchId: string; status: string }>(
    sseUrl,
    "match_status_changed",
    (data) => {
      if (
        data.status === AsyncMetadataStatus.Completed ||
        data.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJobMatch();
      }
    },
  );

  const filteredItems = useMemo(() => {
    const items = matchAnalysis?.items ?? [];
    return items.filter((item) => {
      if (matchFilterTab === MatchVerdict.Fit)
        return item.verdict === MatchVerdict.Fit;
      if (matchFilterTab === MatchVerdict.Gap)
        return item.verdict === MatchVerdict.Gap;
      if (matchFilterTab === MatchVerdict.Unclear)
        return item.verdict === MatchVerdict.Unclear;
      return true;
    });
  }, [matchAnalysis, matchFilterTab]);

  async function handleGenerate(resumeId: string) {
    const [mutationError] = await tryRun(
      generateJobMatch({
        variables: { input: { jobId, resumeId } },
        refetchQueries: ["JobMatch", "Job"],
      }),
    );
    if (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message.replace("Bad Request Exception: ", "")
          : "Failed to generate match analysis.";
      enqueueToast({ title: message, intent: "error" });
    }
  }

  return {
    jobId,
    matchAnalysis,
    matchPk,
    sseUrl,
    status,
    matchLoading,
    matchError,
    refetchJobMatch,
    isProcessing,
    isFailed,
    isCompleted,
    hasRenderableMatchRecord,
    matchFilterTab,
    setMatchFilterTab,
    filteredItems,
    wizardOpen,
    setWizardOpen,
    generating,
    handleGenerate,
  };
}
