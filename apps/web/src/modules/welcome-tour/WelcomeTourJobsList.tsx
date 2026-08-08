"use client";

import type { ReactNode } from "react";
import type { EventData } from "react-joyride";
import { ACTIONS, EVENTS } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect } from "react";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";
import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/tour/useTour";

export interface WelcomeTourJobsListProps {
  tourLabel?: ReactNode;
  portalElement?: HTMLElement | null;
  onOpenNewJob?: () => void;
  onCloseNewJob?: () => void;
  onFocusJobField?: (field: "title" | "company") => void;
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void;
  onSubmitNewJob?: () => void;
  isJobTitleFilled?: boolean;
  isJobCompanyFilled?: boolean;
}

export function WelcomeTourJobsList({
  tourLabel = WELCOME_TOUR_LABEL,
  portalElement,
  onOpenNewJob,
  onCloseNewJob,
  onFocusJobField,
  onJobFormStepChange,
  onSubmitNewJob,
  isJobTitleFilled = false,
  isJobCompanyFilled = false,
}: WelcomeTourJobsListProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activeTour, startTour } = useTour();

  useEffect(() => {
    if (welcomeTourEnabled === true) startTour("welcome-tour");
  }, [startTour, welcomeTourEnabled]);

  if (welcomeTourEnabled !== true || activeTour?.id !== "welcome-tour" || activeTour.phase !== "job-creation")
    return null;

  const steps = pickWelcomeTourSteps(
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
        after: () => onJobFormStepChange?.(null),
      },
    },
  );

  return (
    <JoyrideSegmentedTour
      run
      continuous
      steps={steps}
      portalElement={portalElement ?? undefined}
      onSegmentComplete={onSubmitNewJob}
      onEvent={(event) => handleWelcomeTourEvent(event, onJobFormStepChange, onFocusJobField)}
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
      styles={{
        floater: { pointerEvents: "auto", zIndex: 1000 },
        overlay: { position: portalElement ? "fixed" : "absolute" },
      }}
      tooltipComponent={WelcomeTourTooltip}
    />
  );
}

function handleWelcomeTourEvent(
  event: EventData,
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void,
  onFocusJobField?: (field: "title" | "company") => void,
) {
  if (event.type === EVENTS.TOOLTIP && event.index === 2) onFocusJobField?.("title");
  if (event.type === EVENTS.TOOLTIP && event.index === 3) onFocusJobField?.("company");
  if (event.type === EVENTS.TOUR_END) onJobFormStepChange?.(null);
}
