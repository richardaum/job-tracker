import { useState } from "react";

import { type CreateJobInput } from "@/gql/hooks";
import { ONBOARDING_JOB_DRAFT_ID, saveOnboardingJobDraft } from "@/modules/onboarding/utils/onboardingJobDraft";

/** Creates the tutorial-only job in browser storage and returns its virtual ID. */
export function useCreateLocalJob() {
  const [isCreatingLocalJob, setIsCreatingLocalJob] = useState(false);

  async function createLocalJob(input: CreateJobInput): Promise<string | null> {
    if (!input.title || !input.company) return null;

    setIsCreatingLocalJob(true);
    const didSave = await saveOnboardingJobDraft({ title: input.title, company: input.company });
    setIsCreatingLocalJob(false);

    return didSave ? ONBOARDING_JOB_DRAFT_ID : null;
  }

  return { createLocalJob, isCreatingLocalJob };
}
