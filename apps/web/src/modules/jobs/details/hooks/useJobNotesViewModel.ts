"use client";

import { useJobQuery } from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";
import { type JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

export function useJobNotesViewModel(jobId: string) {
  const { data, error, loading } = useJobQuery({
    variables: { id: jobId },
    fetchPolicy: "cache-and-network",
  });

  const job = data?.job as JobDetailsValues | undefined;
  const status = deriveDetailStatus(loading, error);

  const hasJob = job != null;
  const shouldGoBackToTheJobsList = status === "error";
  const shouldGoBackToJob =
    hasJob && (status === "success" || status === "error");

  return { job, status, shouldGoBackToJob, shouldGoBackToTheJobsList };
}
