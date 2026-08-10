import type { ReactNode } from "react";
import type { Step } from "react-joyride";

export const WELCOME_TOUR_FEATURE_FLAG = "welcome-tour-enabled";
export const WELCOME_TOUR_LABEL = "Create your first job";

export type WelcomeTourStepId =
  | "welcome"
  | "new-job-button"
  | "job-title-input"
  | "job-company-input"
  | "create-job-button"
  | "job-detail-title"
  | "job-status"
  | "job-company"
  | "job-field-actions"
  | "job-description-tab"
  | "job-description-editor"
  | "update-status-button"
  | "update-status-applied"
  | "update-status-save"
  | "update-status-toast"
  | "update-status-reopen"
  | "update-status-screening"
  | "update-status-custom-date"
  | "update-status-interview";

type WelcomeTourStepContent = Omit<Step, "title" | "data" | "before" | "after"> & { advanceOnEnter?: boolean };

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
    advanceOnEnter: true,
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "job-company-input": {
    target: '[data-welcome-tour-step="job-company-input"]',
    placement: "bottom",
    content: "Next, choose the company for this application.",
    advanceOnEnter: true,
    disableFocusTrap: true,
  },
  "create-job-button": {
    target: '[data-welcome-tour-step="create-job-button"]',
    placement: "top",
    content: "Everything looks good. Click Create to add this job to your tracker.",
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
  "job-field-actions": {
    target: '[data-welcome-tour-step="job-field-actions"]',
    placement: "bottom",
    content: "Hover over a field to reveal its available actions. Actions are disabled during this tour.",
  },
  "job-description-tab": {
    target: '[data-welcome-tour-step="job-description-tab"]',
    placement: "bottom",
    content: "Open the Description tab whenever you want to add or review details about this role.",
  },
  "job-description-editor": {
    target: '[data-welcome-tour-step="job-description-editor"]',
    placement: "right",
    content:
      "You can copy and paste a job description here, or manually add information about the role. I added a sample description for you.",
  },
  "update-status-button": {
    target: '[data-welcome-tour-step="update-status-button"]',
    placement: "bottom",
    content: "Now, let's update the status of this job. Let's say you submitted your application today.",
  },
  "update-status-applied": {
    target: '[data-welcome-tour-step="update-status-applied"]',
    placement: "right",
    content: "Select Applied to record that you submitted your application.",
    disableFocusTrap: true,
    advanceOnEnter: true,
    targetWaitTimeout: 2_000,
  },
  "update-status-save": {
    target: '[data-welcome-tour-step="update-status-save"]',
    placement: "top",
    content: "Click Save to record this update.",
    disableFocusTrap: false,
  },
  "update-status-toast": {
    target: '[data-welcome-tour-step="update-status-toast"]',
    placement: "bottom",
    content: "This confirms your update was saved. It disappears automatically after a few seconds.",
    targetWaitTimeout: 2_000,
  },
  "update-status-reopen": {
    target: '[data-welcome-tour-step="update-status-button"]',
    placement: "bottom",
    content: "Nice! Now let's update the status again—this time to schedule a screening interview.",
    targetWaitTimeout: 2_000,
  },
  "update-status-screening": {
    target: '[data-welcome-tour-step="update-status-applied"]',
    placement: "right",
    content: "Select Recruiter Screen to record that a screening interview is coming up.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "update-status-custom-date": {
    target: '[data-welcome-tour-step="update-status-custom-date"]',
    placement: "bottom",
    content: "Turn on Custom date to schedule a future status update.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
  },
  "update-status-interview": {
    target: '[data-welcome-tour-step="update-status-interview"]',
    placement: "bottom",
    content: "Choose +3d to schedule this update for three days from now.",
    disableFocusTrap: true,
    targetWaitTimeout: 2_000,
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
  "job-field-actions",
  "job-description-tab",
  "job-description-editor",
  "update-status-button",
  "update-status-applied",
  "update-status-save",
  "update-status-toast",
  "update-status-reopen",
  "update-status-screening",
  "update-status-custom-date",
  "update-status-interview",
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
    const { advanceOnEnter, ...step } = WELCOME_TOUR_STEPS[id];

    return {
      ...step,
      title,
      before: override?.before,
      after: override?.after,
      data: {
        stepNumber: WELCOME_TOUR_STEP_NUMBER.get(id),
        totalSteps: WELCOME_TOUR_STEP_ORDER.length,
        disablePrimary: override?.disablePrimary,
        advanceOnEnter,
      },
    };
  });
}
