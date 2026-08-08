import { type JobStageEventsQuery, useJobStageEventsQuery } from "@/gql/hooks";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { useWelcomeTourJobStageEvents } from "@/modules/welcome-tour/useWelcomeTourJobStageEvents";
import type { WelcomeTourJobStageEvent } from "@/modules/welcome-tour/welcomeTourJobDraft";

export type JobStageEventData = JobStageEventsQuery["jobStageEvents"][number] | WelcomeTourJobStageEvent;

/** Fetches stage events from the active job data source without shaping presentation data. */
export function useJobStageEventsData(jobId: string) {
  const isLocal = useJobDataSource() === "local";
  const { data } = useJobStageEventsQuery({ variables: { jobId }, fetchPolicy: "cache-and-network", skip: isLocal });
  const localStageEvents = useWelcomeTourJobStageEvents(isLocal);
  const stageEventData: JobStageEventData[] = isLocal ? localStageEvents : (data?.jobStageEvents ?? []);

  return { stageEventData, readOnly: isLocal };
}
