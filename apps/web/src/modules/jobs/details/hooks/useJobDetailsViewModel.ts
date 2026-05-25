"use client";

import { useApolloClient } from "@apollo/client/react";
import { tryRun } from "@job-tracker/try-run";
import { useCallback } from "react";

import {
  ApplicationStage,
  AsyncMetadataStatus,
  JobDocument,
  JobStageEventsDocument,
  useFillJobAutomaticallyMutation,
  useJobFillStatusChangedSubscription,
  useJobQuery,
  useJobStageEventsQuery,
  useJobSummaryStatusChangedSubscription,
} from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";
import { deriveJobFillButtonState } from "@/modules/jobs/details/hooks/deriveJobFillButtonState";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { writeJobSummaryStatusToCache } from "@/modules/jobs/shared/utils/apolloJobSummaryCache";
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
  const apolloClient = useApolloClient();

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

  useJobSummaryStatusChangedSubscription({
    variables: { jobId },
    onData: ({ data }) => {
      const eventData = data.data!.jobSummaryStatusChanged;

      if (eventData.status === AsyncMetadataStatus.Processing) {
        const patched = writeJobSummaryStatusToCache(
          apolloClient.cache,
          jobId,
          AsyncMetadataStatus.Processing,
        );
        if (!patched) void refetchJobAndTimeline();
        return;
      }

      if (
        eventData.status === AsyncMetadataStatus.Completed ||
        eventData.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJobAndTimeline();
      }
    },
  });

  useJobFillStatusChangedSubscription({
    variables: { jobId },
    onData: ({ data }) => {
      const eventData = data.data!.jobFillStatusChanged;

      if (
        eventData.status === AsyncMetadataStatus.Completed ||
        eventData.status === AsyncMetadataStatus.Failed
      ) {
        void refetchJobAndTimeline();
      }
    },
  });

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
  const status = deriveDetailStatus(loading && !job, error);

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
