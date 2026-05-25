"use client";

import { createContext, useContext } from "react";

import { AsyncMetadataStatus, useJobQuery } from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";

export const JobFillStatusContext = createContext<JobFillStatusValue | null>(
  null,
);

export function useJobFillStatusValue(jobId: string) {
  const {
    data: jobData,
    loading: jobLoading,
    error: jobError,
    refetch: refetchJob,
  } = useJobQuery({
    variables: { id: jobId },
    fetchPolicy: "cache-and-network",
  });

  const status = jobData?.job?.fillMetadata?.status;
  const error = jobData?.job?.fillMetadata?.error ?? null;

  const sseUrl = jobId ? `${getApiBaseUrl()}/jobs/${jobId}/stream` : null;

  useEventSource<{ jobId: string; status: string }>(
    sseUrl,
    "fill_status_changed",
    (eventData) => {
      if (
        eventData.status === AsyncMetadataStatus.Completed ||
        eventData.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJob();
      }
    },
  );

  return { status, error, jobLoading, jobError, refetchJob, sseUrl };
}

export type JobFillStatusValue = ReturnType<typeof useJobFillStatusValue>;

export function useJobFillStatus(): JobFillStatusValue {
  const value = useContext(JobFillStatusContext);
  if (!value) {
    throw new Error(
      "useJobFillStatus must be used within JobFillStatusProvider",
    );
  }
  return value;
}
