import type { ReactNode } from "react";
import type { Step } from "react-joyride";

export const NEW_JOB_ONBOARDING_TOUR_LABEL = "Create your first job";

export type OnboardingStepId =
  | "welcome"
  | "new-job-button"
  | "job-title-input"
  | "job-company-input"
  | "create-job-button"
  | "job-detail-title";

type OnboardingStepContent = Omit<Step, "title" | "data" | "before" | "after">;

/**
 * Global source of truth for onboarding step content and order. Steps may be
 * rendered by different pages (each mounts its own Joyride instance, since a
 * tour can't survive route navigation), but they all share one numbering
 * sequence so "X of Y" stays consistent across pages.
 */
const ONBOARDING_STEPS: Record<OnboardingStepId, OnboardingStepContent> = {
  welcome: {
    target: "body",
    placement: "center",
    content: (
      <p>
        Welcome to Job Tracker! This onboarding will guide you through the main features of the application. <br />
        Don't worry about using real data—everything you enter is just for this tutorial.
      </p>
    ),
  },
  "new-job-button": {
    target: '[data-onboarding-step="new-job-button"]',
    placement: "bottom",
    content: "Click here to create a new job application.",
  },
  "job-title-input": {
    target: '[data-onboarding-step="job-title-input"]',
    placement: "bottom",
    content: "Start by giving this application a title.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "job-company-input": {
    target: '[data-onboarding-step="job-company-input"]',
    placement: "bottom",
    content: "Next, choose the company for this application.",
    disableFocusTrap: true,
  },
  "create-job-button": {
    target: '[data-onboarding-step="create-job-button"]',
    placement: "top",
    content: "Everything looks good. Click Create to add this job to your tracker.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "job-detail-title": {
    target: '[data-onboarding-step="job-detail-title"]',
    placement: "bottom",
    content: "This is the job details page. Here you'll see and manage everything about this application.",
  },
};

const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
  "welcome",
  "new-job-button",
  "job-title-input",
  "job-company-input",
  "create-job-button",
  "job-detail-title",
];

const ONBOARDING_STEP_NUMBER = new Map(ONBOARDING_STEP_ORDER.map((id, index) => [id, index + 1]));

interface OnboardingStepOverride {
  before?: Step["before"];
  after?: Step["after"];
  disablePrimary?: boolean;
}

/**
 * Builds Joyride steps for a page's onboarding tour by id, filling in the
 * shared content, correct step number/total, and any page-specific
 * interaction callbacks (e.g. opening a dialog) that the global registry
 * can't own.
 */
export function pickOnboardingSteps(
  ids: OnboardingStepId[],
  title: ReactNode,
  overrides: Partial<Record<OnboardingStepId, OnboardingStepOverride>> = {},
): Step[] {
  return ids.map((id) => {
    const override = overrides[id];

    return {
      ...ONBOARDING_STEPS[id],
      title,
      before: override?.before,
      after: override?.after,
      data: {
        stepNumber: ONBOARDING_STEP_NUMBER.get(id),
        totalSteps: ONBOARDING_STEP_ORDER.length,
        disablePrimary: override?.disablePrimary,
      },
    };
  });
}
