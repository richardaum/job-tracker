import { tryRun } from "@job-tracker/try-run";

export const ONBOARDING_JOB_DRAFT_STORAGE_KEY = "job-tracker:onboarding-job-draft:v1";
export const ONBOARDING_JOB_DRAFT_ID = "onboarding-job";

export interface OnboardingJobDraftInput {
  title: string;
  company: string;
}

interface OnboardingJobDraft extends OnboardingJobDraftInput {
  id: string;
  createdAt: string;
}

/**
 * Stores the tutorial-only job separately from the GraphQL job collection.
 *
 * This utility owns the browser persistence contract; the onboarding hook owns
 * the decision to use it instead of creating a real job.
 */
export async function saveOnboardingJobDraft(input: OnboardingJobDraftInput): Promise<boolean> {
  const [error] = await tryRun(
    Promise.resolve().then(() => {
      const draft: OnboardingJobDraft = { ...input, id: ONBOARDING_JOB_DRAFT_ID, createdAt: new Date().toISOString() };
      localStorage.setItem(ONBOARDING_JOB_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }),
  );

  return !error;
}
