"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback } from "react";

import {
  ApplicationStage,
  AsyncMetadataStatus,
  JobDocument,
  JobStageEventsDocument,
  useFillJobAutomaticallyMutation,
  useJobQuery,
  useJobStageEventsQuery,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";
import { deriveJobFillButtonState } from "@/modules/jobs/details/hooks/deriveJobFillButtonState";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
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

  const { data: stageEventsData, refetch: refetchStageEvents } =
    useJobStageEventsQuery({
      variables: { jobId },
      skip: !includeStageEvents,
      fetchPolicy: "cache-and-network",
    });

  const refetchJobAndTimeline = useCallback(async () => {
    await Promise.all([
      refetch(),
      includeStageEvents ? refetchStageEvents() : Promise.resolve(undefined),
    ]);
  }, [refetch, refetchStageEvents, includeStageEvents]);

  const sseUrl = jobId ? `${getApiBaseUrl()}/jobs/${jobId}/stream` : null;

  useEventSource(sseUrl, "summary_status_changed", () => {
    void refetchJobAndTimeline();
  });

  useEventSource<{ jobId: string; status: string }>(
    sseUrl,
    "fill_status_changed",
    (data) => {
      if (
        data.status === AsyncMetadataStatus.Completed ||
        data.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJobAndTimeline();
      }
    },
  );

  const refetchQueries = includeStageEvents
    ? [
        { query: JobDocument, variables: { id: jobId } },
        { query: JobStageEventsDocument, variables: { jobId } },
      ]
    : [{ query: JobDocument, variables: { id: jobId } }];

  const [fillJobAutomatically, { loading: fillMutationLoading }] =
    useFillJobAutomaticallyMutation({ refetchQueries });

  const triggerFillAutomatically = useCallback(async () => {
    const [err] = await tryRun(fillJobAutomatically({ variables: { jobId } }));
    return {
      error: err instanceof Error ? err : err ? new Error(String(err)) : null,
    };
  }, [fillJobAutomatically, jobId]);

  const job = data?.job as JobDetailsValues | undefined;
  const currentStage =
    stageEventsData?.jobStageEvents[0]?.toStage ?? ApplicationStage.New;
  const currentStageReason = stageEventsData?.jobStageEvents[0]?.reason ?? null;

  const sourcePrimaryText = formatJobSourceLabel(job?.source);
  const status = deriveDetailStatus(loading, error);

  const displayTitle = job ? jobDetailDisplayTitle(job.title) : null;

  const fillButtonState = deriveJobFillButtonState(
    job?.fillMetadata?.status,
    fillMutationLoading,
  );

  return {
    job,
    currentStage,
    currentStageReason,
    status,
    sourcePrimaryText,
    refetch,
    displayTitle,
    fillButtonState,
    triggerFillAutomatically,
  };
}
