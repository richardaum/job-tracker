"use client";

import { ACTIONS } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";
import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
  type WelcomeTourStepId,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/tour/useTour";

type WelcomeTourJobDetailsProps = {
  onFieldActionsVisibilityChange: (visible: boolean) => void;
  onDescriptionOpen: () => void;
  onUpdateStatus: () => void;
};

export function WelcomeTourJobDetails({
  onFieldActionsVisibilityChange,
  onDescriptionOpen,
  onUpdateStatus,
}: WelcomeTourJobDetailsProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activeTour } = useTour();

  if (
    welcomeTourEnabled !== true ||
    activeTour?.id !== "welcome-tour" ||
    (activeTour.phase !== "job-details" && activeTour.phase !== "update-status")
  )
    return null;

  const stepIds: WelcomeTourStepId[] =
    activeTour.phase === "update-status"
      ? ["update-status-button", "update-status-applied", "update-status-interview"]
      : ["job-detail-title", "job-status", "job-company", "job-field-actions", "job-description-tab"];
  const steps = pickWelcomeTourSteps(stepIds, WELCOME_TOUR_LABEL, {
    "job-field-actions": {
      before: async () => onFieldActionsVisibilityChange(true),
      after: () => onFieldActionsVisibilityChange(false),
    },
    "update-status-button": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onUpdateStatus();
      },
    },
  });

  return (
    <JoyrideSegmentedTour
      run
      continuous
      steps={steps}
      onSegmentComplete={activeTour.phase === "job-details" ? onDescriptionOpen : undefined}
      locale={{ last: "Got it" }}
      options={{
        buttons: ["primary"],
        skipBeacon: true,
        overlayColor: "var(--semantic-color-overlay-backdrop)",
        overlayClickAction: false,
        dismissKeyAction: false,
        spotlightPadding: 8,
        spotlightRadius: 10,
      }}
      floatingOptions={{ hideArrow: true }}
      styles={{ floater: { pointerEvents: "auto", zIndex: 1000 } }}
      tooltipComponent={WelcomeTourTooltip}
    />
  );
}
