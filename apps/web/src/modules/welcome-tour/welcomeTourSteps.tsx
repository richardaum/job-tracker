import type { ReactNode } from "react";
import type { Step } from "react-joyride";

export const WELCOME_TOUR_FEATURE_FLAG = "welcome-tour-enabled";
export const NEW_JOB_WELCOME_TOUR_LABEL = "Create your first job";

export type WelcomeTourStepId =
  | "welcome"
  | "new-job-button"
  | "job-title-input"
  | "job-company-input"
  | "create-job-button"
  | "job-detail-title"
  | "job-status"
  | "job-company"
  | "job-description-editor";

type WelcomeTourStepContent = Omit<Step, "title" | "data" | "before" | "after">;

/**
 * Global source of truth for welcome tour step content and order. Steps may be
 * rendered by different pages (each mounts its own Joyride instance, since a
 * tour can't survive route navigation), but they all share one numbering
 * sequence so "X of Y" stays consistent across pages.
 */
const WELCOME_TOUR_STEPS: Record<WelcomeTourStepId, WelcomeTourStepContent> = {
  welcome: {
    target: "body",
    placement: "center",
    content: (
      <p>
        Welcome to Job Tracker! This welcome tour will guide you through the main features of the application. <br />
        Don't worry about using real data—everything you enter is just for this tutorial.
      </p>
    ),
  },
  "new-job-button": {
    target: '[data-welcome-tour-step="new-job-button"]',
    placement: "bottom",
    content: "Click here to create a new job application.",
  },
  "job-title-input": {
    target: '[data-welcome-tour-step="job-title-input"]',
    placement: "bottom",
    content: "Start by giving this application a title.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "job-company-input": {
    target: '[data-welcome-tour-step="job-company-input"]',
    placement: "bottom",
    content: "Next, choose the company for this application.",
    disableFocusTrap: true,
  },
  "create-job-button": {
    target: '[data-welcome-tour-step="create-job-button"]',
    placement: "top",
    content: "Everything looks good. Click Create to add this job to your tracker.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "job-detail-title": {
    target: '[data-welcome-tour-step="job-detail-title"]',
    placement: "bottom",
    content: "This is the job details page. Here you'll see and manage everything about this application.",
  },
  "job-status": {
    target: '[data-welcome-tour-step="job-status"]',
    placement: "bottom",
    content: "Use Status to keep track of where you are in the application process.",
  },
  "job-company": {
    target: '[data-welcome-tour-step="job-company"]',
    placement: "bottom",
    content: "This is the company linked to this job. You can view its details or switch it whenever needed.",
  },
  "job-description-editor": {
    target: '[data-welcome-tour-step="job-description-editor"]',
    placement: "top",
    content: "Add the job description here, along with role context, the tech stack, or interview notes.",
  },
};

const WELCOME_TOUR_STEP_ORDER: WelcomeTourStepId[] = [
  "welcome",
  "new-job-button",
  "job-title-input",
  "job-company-input",
  "create-job-button",
  "job-detail-title",
  "job-status",
  "job-company",
  "job-description-editor",
];

const WELCOME_TOUR_STEP_NUMBER = new Map(WELCOME_TOUR_STEP_ORDER.map((id, index) => [id, index + 1]));

interface WelcomeTourStepOverride {
  before?: Step["before"];
  after?: Step["after"];
  disablePrimary?: boolean;
}

/**
 * Builds Joyride steps for a page's welcome tour by id, filling in the
 * shared content, correct step number/total, and any page-specific
 * interaction callbacks (e.g. opening a dialog) that the global registry
 * can't own.
 */
export function pickWelcomeTourSteps(
  ids: WelcomeTourStepId[],
  title: ReactNode,
  overrides: Partial<Record<WelcomeTourStepId, WelcomeTourStepOverride>> = {},
): Step[] {
  return ids.map((id) => {
    const override = overrides[id];

    return {
      ...WELCOME_TOUR_STEPS[id],
      title,
      before: override?.before,
      after: override?.after,
      data: {
        stepNumber: WELCOME_TOUR_STEP_NUMBER.get(id),
        totalSteps: WELCOME_TOUR_STEP_ORDER.length,
        disablePrimary: override?.disablePrimary,
      },
    };
  });
}
