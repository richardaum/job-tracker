"use client";

import type { ReactNode } from "react";
import type { EventData } from "react-joyride";
import { ACTIONS, EVENTS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { OnboardingTooltip } from "@/modules/onboarding/OnboardingTooltip";
import { NEW_JOB_ONBOARDING_TOUR_LABEL, pickOnboardingSteps } from "@/modules/onboarding/onboardingSteps";

export interface OnboardingJobsListTourProps {
  tourLabel?: ReactNode;
  onOpenNewJob?: () => void;
  onCloseNewJob?: () => void;
  onFocusJobField?: (field: "title" | "company") => void;
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void;
  onSubmitNewJob?: () => void;
  isJobTitleFilled?: boolean;
  isJobCompanyFilled?: boolean;
}

export function OnboardingJobsListTour({
  tourLabel = NEW_JOB_ONBOARDING_TOUR_LABEL,
  onOpenNewJob,
  onCloseNewJob,
  onFocusJobField,
  onJobFormStepChange,
  onSubmitNewJob,
  isJobTitleFilled = false,
  isJobCompanyFilled = false,
}: OnboardingJobsListTourProps) {
  const onboardingEnabled = useFeatureFlagEnabled("onboarding-enabled");

  if (onboardingEnabled !== true) return null;

  const steps = pickOnboardingSteps(
    ["welcome", "new-job-button", "job-title-input", "job-company-input", "create-job-button"],
    tourLabel,
    {
      "job-title-input": {
        disablePrimary: !isJobTitleFilled,
        before: async () => {
          onOpenNewJob?.();
          onJobFormStepChange?.("title");
        },
        after: ({ action }) => {
          onJobFormStepChange?.(null);
          if (action === ACTIONS.PREV) onCloseNewJob?.();
        },
      },
      "job-company-input": {
        disablePrimary: !isJobCompanyFilled,
        before: async () => onJobFormStepChange?.("company"),
        after: () => onJobFormStepChange?.(null),
      },
      "create-job-button": {
        before: async () => onJobFormStepChange?.("create"),
        after: ({ action }) => {
          onJobFormStepChange?.(null);
          if (action === ACTIONS.NEXT) onSubmitNewJob?.();
        },
      },
    },
  );

  return (
    <Joyride
      run
      continuous
      steps={steps}
      onEvent={(event) => handleOnboardingEvent(event, onJobFormStepChange, onFocusJobField)}
      options={{
        buttons: ["back", "primary", "skip"],
        skipBeacon: true,
        overlayColor: "var(--semantic-color-overlay-backdrop)",
        overlayClickAction: false,
        dismissKeyAction: false,
        spotlightPadding: 8,
        spotlightRadius: 10,
      }}
      floatingOptions={{ hideArrow: true }}
      styles={{ floater: { pointerEvents: "auto", zIndex: 1000 } }}
      tooltipComponent={OnboardingTooltip}
    />
  );
}

function handleOnboardingEvent(
  event: EventData,
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void,
  onFocusJobField?: (field: "title" | "company") => void,
) {
  if (event.type === EVENTS.TOOLTIP && event.index === 2) onFocusJobField?.("title");
  if (event.type === EVENTS.TOOLTIP && event.index === 3) onFocusJobField?.("company");
  if (event.type === EVENTS.TOUR_END) onJobFormStepChange?.(null);
}
