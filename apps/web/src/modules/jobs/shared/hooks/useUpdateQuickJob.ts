import { tryRun } from "@job-tracker/try-run";

import { type UpdateJobInput, useUpdateJobMutation } from "@/gql/hooks";

import { quickJobRefetchQueries } from "@/modules/jobs/shared/hooks/quickJobRefetchQueries";

interface UseUpdateQuickJobOptions {
  onUpdated: () => void;
  onError: () => void;
}

export function useUpdateQuickJob({ onUpdated, onError }: UseUpdateQuickJobOptions) {
  const [updateJob, { loading: isUpdatingQuickJob }] = useUpdateJobMutation({
    refetchQueries: quickJobRefetchQueries,
    awaitRefetchQueries: true,
  });

  async function updateQuickJob(jobId: string, input: UpdateJobInput): Promise<boolean> {
    const [error] = await tryRun(updateJob({ variables: { id: jobId, input } }));
    if (error) {
      onError();
      return false;
    }

    onUpdated();
    return true;
  }

  return { updateQuickJob, isUpdatingQuickJob };
}
