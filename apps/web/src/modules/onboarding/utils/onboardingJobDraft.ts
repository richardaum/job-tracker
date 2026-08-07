import { tryRun } from "@job-tracker/try-run";

import { ApplicationStage } from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

export const ONBOARDING_JOB_DRAFT_STORAGE_KEY = "job-tracker:onboarding-job-draft:v1";
export const ONBOARDING_JOB_DRAFT_ID = "onboarding-job";

export interface OnboardingJobDraftInput {
  title: string;
  company: string;
}

export interface OnboardingJobDraft extends OnboardingJobDraftInput {
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

/**
 * Reads the tutorial-only job draft persisted by {@link saveOnboardingJobDraft}.
 */
export function getOnboardingJobDraft(): OnboardingJobDraft | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(ONBOARDING_JOB_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OnboardingJobDraft;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

/**
 * Shapes a persisted tutorial draft as the job selection used by the details UI.
 */
export function toSyntheticJob(draft: OnboardingJobDraft): JobDetailsValues {
  return {
    __typename: "JobType",
    id: draft.id,
    title: draft.title,
    companyId: null,
    description: null,
    urls: [],
    source: null,
    tags: [],
    location: null,
    workRegion: null,
    sourceRunId: null,
    summary: null,
    htmlContent: null,
    currentStage: ApplicationStage.New,
    currentStageReason: null,
    currentStageAt: draft.createdAt,
    createdAt: draft.createdAt,
    company: { __typename: "CompanyType", id: "onboarding-company", name: draft.company, description: null },
    summaryMetadata: null,
    fillMetadata: null,
    match: null,
  };
}
