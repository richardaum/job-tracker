import { useState } from "react";

import { type CreateJobInput } from "@/gql/hooks";
import { WELCOME_TOUR_JOB_DRAFT_ID, saveWelcomeTourJobDraft } from "@/modules/welcome-tour/welcomeTourJobDraft";

/** Creates the tutorial-only job in browser storage and returns its virtual ID. */
export function useCreateLocalJob() {
  const [isCreatingLocalJob, setIsCreatingLocalJob] = useState(false);

  async function createLocalJob(input: CreateJobInput): Promise<string | null> {
    if (!input.title || !input.company) return null;

    setIsCreatingLocalJob(true);
    const didSave = await saveWelcomeTourJobDraft({ title: input.title, company: input.company });
    setIsCreatingLocalJob(false);

    return didSave ? WELCOME_TOUR_JOB_DRAFT_ID : null;
  }

  return { createLocalJob, isCreatingLocalJob };
}
