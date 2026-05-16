"use client";

import {
  ApplicationStage,
  useApplicationQuery,
  useApplicationStageEventsQuery,
} from "@/gql/hooks";
import { type ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { formatApplicationSourceLabel } from "@/modules/applications/shared/utils/applicationSourceLabel";

export interface UseApplicationDetailsViewModelOptions {
  /**
   * When false, skips the stage-events query (e.g. notes-only route).
   * Defaults to true for the main application details screen.
   */
  includeStageEvents?: boolean;
}

export function useApplicationDetailsViewModel(
  applicationId: string,
  options?: UseApplicationDetailsViewModelOptions,
) {
  const includeStageEvents = options?.includeStageEvents ?? true;

  const { data, loading, error, refetch } = useApplicationQuery({
    variables: { id: applicationId },
    fetchPolicy: "cache-and-network",
  });

  const { data: stageEventsData } = useApplicationStageEventsQuery({
    variables: { applicationId },
    skip: !includeStageEvents,
    fetchPolicy: "cache-and-network",
  });

  const application = data?.application as ApplicationDetailsValues | undefined;
  const currentStage =
    stageEventsData?.applicationStageEvents[0]?.toStage ?? ApplicationStage.New;
  const currentStageReason =
    stageEventsData?.applicationStageEvents[0]?.reason ?? null;

  const sourcePrimaryText = formatApplicationSourceLabel(application?.source);

  return {
    application,
    currentStage,
    currentStageReason,
    loading,
    error,
    showInitialLoading: loading && !data,
    sourcePrimaryText,
    refetch,
    draftApplicationId: application?.draftApplicationId ?? null,
  };
}
