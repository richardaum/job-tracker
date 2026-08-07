"use client";

// TODO: useJobFillStatusChangedSubscription is duplicated — once here in
// useJobFillStatusValue (called by JobFillStatusProvider) and again in
// useJobDetailsViewModel (called by JobDetailsLayout). When the layout is the
// single source of this subscription, remove it from useJobDetailsViewModel.
// Tab pages that need fill status should consume via useJobFillStatus() context
// instead of calling useJobDetailsViewModel.
// Reference pattern: JobMatchStatusProvider + useJobMatchStatusValue.

import { createContext, useContext } from "react";

import { AsyncMetadataStatus, useJobFillStatusChangedSubscription, useJobQuery } from "@/gql/hooks";

export const JobFillStatusContext = createContext<JobFillStatusValue | null>(null);

export function useJobFillStatusValue(jobId: string, enabled = true) {
  const {
    data: jobData,
    loading: jobLoading,
    error: jobError,
    refetch: refetchJob,
  } = useJobQuery({ variables: { id: jobId }, fetchPolicy: "cache-and-network", skip: !enabled });

  const status = jobData?.job?.fillMetadata?.status;
  const error = jobData?.job?.fillMetadata?.error ?? null;

  useJobFillStatusChangedSubscription({
    variables: { jobId },
    skip: !enabled,
    onData: ({ data }) => {
      const eventData = data.data!.jobFillStatusChanged;

      if (
        eventData.status === AsyncMetadataStatus.Processing ||
        eventData.status === AsyncMetadataStatus.Completed ||
        eventData.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJob();
      }
    },
  });

  return { status, error, jobLoading, jobError, refetchJob };
}

export type JobFillStatusValue = ReturnType<typeof useJobFillStatusValue>;

export function useJobFillStatus(): JobFillStatusValue {
  const value = useContext(JobFillStatusContext);
  if (!value) {
    throw new Error("useJobFillStatus must be used within JobFillStatusProvider");
  }
  return value;
}
