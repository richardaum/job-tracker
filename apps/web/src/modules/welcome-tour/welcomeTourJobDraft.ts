import { tryRun } from "@job-tracker/try-run";

import { ApplicationStage, type CreateJobStageEventInput } from "@/gql/hooks";
import type { UpdateJobInput } from "@/gql/hooks";
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
  description?: string | null;
  stageEvents?: WelcomeTourJobStageEvent[];
}

export interface WelcomeTourJobStageEvent {
  id: string;
  fromStage: ApplicationStage | null;
  toStage: ApplicationStage;
  reason: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

const draftListeners = new Set<() => void>();
let draftRevision = 0;

function notifyDraftListeners() {
  draftRevision += 1;
  draftListeners.forEach((listener) => listener());
}

export function subscribeToWelcomeTourJobDraft(listener: () => void) {
  draftListeners.add(listener);
  return () => draftListeners.delete(listener);
}

export function getWelcomeTourJobDraftRevision() {
  return draftRevision;
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
      notifyDraftListeners();
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

/** Updates the local tutorial draft with the same input shape used by job editors. */
export async function updateWelcomeTourJobDraft(id: string, input: UpdateJobInput): Promise<boolean> {
  if (id !== WELCOME_TOUR_JOB_DRAFT_ID) return false;

  const draft = getWelcomeTourJobDraft();
  if (!draft) return false;

  const [error] = await tryRun(
    Promise.resolve().then(() => {
      const nextDraft: WelcomeTourJobDraft = {
        ...draft,
        title: input.title ?? draft.title,
        description: input.description === undefined ? draft.description : input.description,
      };
      localStorage.setItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
      notifyDraftListeners();
    }),
  );

  return !error;
}

/** Adds a tutorial-only stage event and notifies the local details view. */
export async function createWelcomeTourJobStageEvent(input: CreateJobStageEventInput): Promise<boolean> {
  if (input.jobId !== WELCOME_TOUR_JOB_DRAFT_ID) return false;

  const draft = getWelcomeTourJobDraft();
  if (!draft) return false;

  const [error] = await tryRun(
    Promise.resolve().then(() => {
      const createdAt = new Date().toISOString();
      const stageEvent: WelcomeTourJobStageEvent = {
        id: `welcome-tour-stage-event-${Date.now()}`,
        fromStage: draft.stageEvents?.[0]?.toStage ?? ApplicationStage.New,
        toStage: input.toStage,
        reason: input.reason ?? null,
        scheduledAt: input.scheduledAt ?? null,
        createdAt,
      };
      const nextDraft: WelcomeTourJobDraft = { ...draft, stageEvents: [stageEvent, ...(draft.stageEvents ?? [])] };
      localStorage.setItem(WELCOME_TOUR_JOB_DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
      notifyDraftListeners();
    }),
  );

  return !error;
}

/**
 * Shapes a persisted tutorial draft as the job selection used by the details UI.
 */
export function toSyntheticJob(draft: WelcomeTourJobDraft): JobDetailsValues {
  const currentStageEvent = draft.stageEvents?.[0];

  return {
    __typename: "JobType",
    id: draft.id,
    title: draft.title,
    companyId: null,
    description: draft.description ?? createWelcomeTourJobDescription(draft),
    urls: [],
    source: null,
    tags: [],
    location: null,
    workRegion: null,
    sourceRunId: null,
    summary: null,
    htmlContent: null,
    currentStage: currentStageEvent?.toStage ?? ApplicationStage.New,
    currentStageReason: currentStageEvent?.reason ?? null,
    currentStageAt: currentStageEvent?.scheduledAt ?? currentStageEvent?.createdAt ?? draft.createdAt,
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
