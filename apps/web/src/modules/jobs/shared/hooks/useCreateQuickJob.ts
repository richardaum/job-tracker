import { tryRun } from "@job-tracker/try-run";

import { type CreateJobInput, useCreateJobMutation } from "@/gql/hooks";

import { quickJobRefetchQueries } from "@/modules/jobs/shared/hooks/quickJobRefetchQueries";
import { useCreateLocalJob } from "@/modules/jobs/shared/hooks/useCreateLocalJob";
import type { JobPersistenceMode } from "@/modules/jobs/shared/types/jobPersistenceMode";

interface UseCreateQuickJobOptions {
  onCreated: (jobId: string) => void;
  onError: () => void;
  persistenceMode?: JobPersistenceMode;
}

export function useCreateQuickJob({ onCreated, onError, persistenceMode = "database" }: UseCreateQuickJobOptions) {
  const [createJob, { loading: isCreatingQuickJob }] = useCreateJobMutation({
    refetchQueries: quickJobRefetchQueries,
    awaitRefetchQueries: true,
  });
  const { createLocalJob, isCreatingLocalJob } = useCreateLocalJob();

  const persistJob: Record<JobPersistenceMode, (input: CreateJobInput) => Promise<string | null | undefined>> = {
    local: async (input) => {
      return await createLocalJob(input);
    },
    database: async (input) => {
      const [, result] = await tryRun(createJob({ variables: { input } }));
      return result?.data?.createJob.id;
    },
  };

  async function createQuickJob(input: CreateJobInput): Promise<boolean> {
    const jobId = await persistJob[persistenceMode](input);

    if (!jobId) {
      onError();
      return false;
    }

    onCreated(jobId);
    return true;
  }

  return { createQuickJob, isCreatingQuickJob: isCreatingQuickJob || isCreatingLocalJob };
}
