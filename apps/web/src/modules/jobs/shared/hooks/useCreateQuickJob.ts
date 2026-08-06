import { tryRun } from "@job-tracker/try-run";

import { type CreateJobInput, useCreateJobMutation } from "@/gql/hooks";

import { quickJobRefetchQueries } from "@/modules/jobs/shared/hooks/quickJobRefetchQueries";

interface UseCreateQuickJobOptions {
  onCreated: (jobId: string) => void;
  onError: () => void;
}

export function useCreateQuickJob({ onCreated, onError }: UseCreateQuickJobOptions) {
  const [createJob, { loading: isCreatingQuickJob }] = useCreateJobMutation({
    refetchQueries: quickJobRefetchQueries,
    awaitRefetchQueries: true,
  });

  async function createQuickJob(input: CreateJobInput): Promise<boolean> {
    const [error, result] = await tryRun(createJob({ variables: { input } }));
    const jobId = result?.data?.createJob.id;
    if (error || !jobId) {
      onError();
      return false;
    }

    onCreated(jobId);
    return true;
  }

  return { createQuickJob, isCreatingQuickJob };
}
