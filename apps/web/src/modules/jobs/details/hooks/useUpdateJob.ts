import { useState } from "react";

import { type UpdateJobInput, useUpdateJobMutation } from "@/gql/hooks";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { updateWelcomeTourJobDraft } from "@/modules/welcome-tour/welcomeTourJobDraft";

type UpdateJobVariables = { id: string; input: UpdateJobInput };
type UpdateJob = (options: { variables: UpdateJobVariables }) => Promise<void>;

/** Selects database or local-draft job updates without changing hook order. */
export function useUpdateJob(): [UpdateJob, { loading: boolean }] {
  const dataSource = useJobDataSource();
  const [updateDatabase, { loading: databaseLoading }] = useUpdateJobMutation();
  const [localLoading, setLocalLoading] = useState(false);

  async function updateJob({ variables }: { variables: UpdateJobVariables }) {
    if (dataSource === "database") {
      await updateDatabase({ variables });
      return;
    }

    setLocalLoading(true);
    try {
      const didUpdate = await updateWelcomeTourJobDraft(variables.id, variables.input);
      if (!didUpdate) {
        throw new Error("Failed to update the welcome tour job draft.");
      }
    } finally {
      setLocalLoading(false);
    }
  }

  return [updateJob, { loading: dataSource === "database" ? databaseLoading : localLoading }];
}
