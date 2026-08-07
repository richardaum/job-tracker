import { useState } from "react";

import { type UpdateJobInput, useUpdateJobMutation } from "@/gql/hooks";
import { useJobApiMode } from "@/modules/jobs/details/hooks/JobApiContext";
import { updateWelcomeTourJobDraft } from "@/modules/welcome-tour/welcomeTourJobDraft";

type UpdateJobVariables = { id: string; input: UpdateJobInput };
type UpdateJob = (options: { variables: UpdateJobVariables }) => Promise<void>;

/** Selects database or local-draft job updates without changing hook order. */
export function useUpdateJob(): [UpdateJob, { loading: boolean }] {
  const mode = useJobApiMode();
  const [updateDatabase, { loading: databaseLoading }] = useUpdateJobMutation();
  const [localLoading, setLocalLoading] = useState(false);

  async function updateJob({ variables }: { variables: UpdateJobVariables }) {
    if (mode === "database") {
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

  return [updateJob, { loading: mode === "database" ? databaseLoading : localLoading }];
}
