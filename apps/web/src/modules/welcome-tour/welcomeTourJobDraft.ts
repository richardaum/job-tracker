import { tryRun } from "@job-tracker/try-run";

import { ApplicationStage } from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

export const WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY = "job-tracker:welcome-tour-job-draft:v1";
export const WELCOME_TOUR_JOB_DRAFT_ID = "welcome-tour-job";

export interface WelcomeTourJobDraftInput {
  title: string;
  company: string;
}

export interface WelcomeTourJobDraft extends WelcomeTourJobDraftInput {
  id: string;
  createdAt: string;
}

/**
 * Stores the tutorial-only job separately from the GraphQL job collection.
 *
 * This utility owns the browser persistence contract; the welcome tour hook owns
 * the decision to use it instead of creating a real job.
 */
export async function saveWelcomeTourJobDraft(input: WelcomeTourJobDraftInput): Promise<boolean> {
  const [error] = await tryRun(
    Promise.resolve().then(() => {
      const draft: WelcomeTourJobDraft = {
        ...input,
        id: WELCOME_TOUR_JOB_DRAFT_ID,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }),
  );

  return !error;
}

/**
 * Reads the tutorial-only job draft persisted by {@link saveWelcomeTourJobDraft}.
 */
export function getWelcomeTourJobDraft(): WelcomeTourJobDraft | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WelcomeTourJobDraft;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

/**
 * Shapes a persisted tutorial draft as the job selection used by the details UI.
 */
export function toSyntheticJob(draft: WelcomeTourJobDraft): JobDetailsValues {
  return {
    __typename: "JobType",
    id: draft.id,
    title: draft.title,
    companyId: null,
    description: createWelcomeTourJobDescription(draft),
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
    company: { __typename: "CompanyType", id: "welcome-tour-company", name: draft.company, description: null },
    summaryMetadata: null,
    fillMetadata: null,
    match: null,
  };
}

function createWelcomeTourJobDescription(draft: WelcomeTourJobDraft): string {
  return `${draft.company} is looking for a ${draft.title} to join the team.

About the role
- Collaborate with cross-functional partners to deliver high-quality work.
- Help improve the product experience through thoughtful execution and feedback.

What we're looking for
- Experience relevant to the role and a collaborative mindset.
- Clear communication and a willingness to learn.`;
}
