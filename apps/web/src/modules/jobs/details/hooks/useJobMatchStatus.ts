"use client";

import { createContext, useContext } from "react";

import {
  AsyncMetadataStatus,
  useJobMatchQuery,
  useJobMatchStatusChangedSubscription,
} from "@/gql/hooks";

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

  useJobMatchStatusChangedSubscription({
    variables: { jobId },
    onData: ({ data }) => {
      const eventData = data.data?.jobMatchStatusChanged;
      if (!eventData) return;

      if (
        eventData.status === AsyncMetadataStatus.Completed ||
        eventData.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJobMatch();
      }
    },
  });

  return {
    matchAnalysis,
    matchPk,
    status,
    error,
    matchLoading,
    matchError,
    refetchJobMatch,
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
