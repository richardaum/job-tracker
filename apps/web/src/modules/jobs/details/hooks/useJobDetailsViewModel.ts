"use client";

import {
  ApplicationStage,
  useJobQuery,
  useJobStageEventsQuery,
} from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";
import { type JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { formatJobSourceLabel } from "@/modules/jobs/shared/utils/jobSourceLabel";

export interface UseJobDetailsViewModelOptions {
  /**
   * When false, skips the stage-events query (e.g. notes-only route).
   * Defaults to true for the main job details screen.
   */
  includeStageEvents?: boolean;
}

export function useJobDetailsViewModel(
  jobId: string,
  options?: UseJobDetailsViewModelOptions,
) {
  const includeStageEvents = options?.includeStageEvents ?? true;

  const { data, loading, error, refetch } = useJobQuery({
    variables: { id: jobId },
    fetchPolicy: "cache-and-network",
  });

  const { data: stageEventsData } = useJobStageEventsQuery({
    variables: { jobId },
    skip: !includeStageEvents,
    fetchPolicy: "cache-and-network",
  });

  const job = data?.job as JobDetailsValues | undefined;
  const currentStage =
    stageEventsData?.jobStageEvents[0]?.toStage ?? ApplicationStage.New;
  const currentStageReason = stageEventsData?.jobStageEvents[0]?.reason ?? null;

  const sourcePrimaryText = formatJobSourceLabel(job?.source);
  const status = deriveDetailStatus(loading, error);

  return {
    job,
    currentStage,
    currentStageReason,
    status,
    sourcePrimaryText,
    refetch,
  };
}
