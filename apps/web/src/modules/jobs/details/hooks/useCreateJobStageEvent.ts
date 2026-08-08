import { useState } from "react";

import { type CreateJobStageEventInput, JobStageEventsDocument, useCreateJobStageEventMutation } from "@/gql/hooks";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { createWelcomeTourJobStageEvent } from "@/modules/welcome-tour/welcomeTourJobDraft";

type CreateJobStageEvent = (input: CreateJobStageEventInput) => Promise<void>;

/** Creates a database or tutorial-local status event while preserving hook order. */
export function useCreateJobStageEvent(): [CreateJobStageEvent, { loading: boolean }] {
  const dataSource = useJobDataSource();
  const [createDatabaseStageEvent, { loading: databaseLoading }] = useCreateJobStageEventMutation();
  const [localLoading, setLocalLoading] = useState(false);

  async function createJobStageEvent(input: CreateJobStageEventInput) {
    if (dataSource === "database") {
      await createDatabaseStageEvent({
        variables: { input },
        refetchQueries: [{ query: JobStageEventsDocument, variables: { jobId: input.jobId } }],
      });
      return;
    }

    setLocalLoading(true);
    try {
      const didCreate = await createWelcomeTourJobStageEvent(input);
      if (!didCreate) throw new Error("Failed to create the welcome tour job stage event.");
    } finally {
      setLocalLoading(false);
    }
  }

  return [createJobStageEvent, { loading: dataSource === "database" ? databaseLoading : localLoading }];
}
