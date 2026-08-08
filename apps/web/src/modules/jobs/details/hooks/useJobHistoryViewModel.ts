import { ApplicationStage } from "@/gql/hooks";
import { useJobStageEventsData } from "@/modules/jobs/details/hooks/useJobStageEventsData";

export type JobHistoryStageEvent = {
  id: string;
  fromStage: ApplicationStage | null;
  toStage: ApplicationStage;
  reason: string | null;
  scheduledAt: string | null;
  createdAt: string;
};

/** Shapes stage-event data for the job history panel. */
export function useJobHistoryViewModel(jobId: string) {
  const { stageEventData, readOnly } = useJobStageEventsData(jobId);
  const stageEvents: JobHistoryStageEvent[] = stageEventData.map((event) => ({
    id: event.id,
    fromStage: event.fromStage ?? null,
    toStage: event.toStage,
    reason: event.reason ?? null,
    scheduledAt: event.scheduledAt ?? null,
    createdAt: event.createdAt,
  }));

  return { stageEvents, currentStage: stageEvents[0]?.toStage ?? ApplicationStage.New, readOnly };
}
