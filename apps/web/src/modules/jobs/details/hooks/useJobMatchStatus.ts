"use client";

import { createContext, useContext } from "react";

import { AsyncMetadataStatus, useJobMatchQuery } from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";

export const JobMatchStatusContext = createContext<JobMatchStatusValue | null>(
  null,
);

export function useJobMatchStatusValue(jobId: string) {
  const {
    data: matchData,
    loading: matchLoading,
    error: matchError,
    refetch: refetchJobMatch,
  } = useJobMatchQuery({
    variables: { jobId },
    fetchPolicy: "cache-and-network",
  });

  const matchAnalysis = matchData?.jobMatch ?? null;
  const matchPk = matchAnalysis?.id ?? null;
  const status = matchAnalysis?.generationMetadata?.status;
  const error = matchAnalysis?.generationMetadata?.error ?? null;

  const sseUrl = jobId ? `${getApiBaseUrl()}/jobs/${jobId}/stream` : null;

  useEventSource<{ jobId: string; matchId: string; status: string }>(
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

  return {
    matchAnalysis,
    matchPk,
    status,
    error,
    matchLoading,
    matchError,
    refetchJobMatch,
    sseUrl,
  };
}

export type JobMatchStatusValue = ReturnType<typeof useJobMatchStatusValue>;

export function useJobMatchStatus(): JobMatchStatusValue {
  const value = useContext(JobMatchStatusContext);
  if (!value) {
    throw new Error(
      "useJobMatchStatus must be used within JobMatchStatusProvider",
    );
  }
  return value;
}
