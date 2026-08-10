"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";
import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_FEATURE_FLAG,
  WELCOME_TOUR_LABEL,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/tour/useTour";

type WelcomeTourStatusHistoryProps = { onReturnToJobs: () => void };

/** Completes the welcome tour by highlighting the scheduled status event. */
export function WelcomeTourStatusHistory({ onReturnToJobs }: WelcomeTourStatusHistoryProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activeTour } = useTour();

  if (welcomeTourEnabled !== true || activeTour?.id !== "welcome-tour" || activeTour.phase !== "status-history") {
    return null;
  }

  return (
    <JoyrideSegmentedTour
      run
      continuous
      steps={pickWelcomeTourSteps(["update-status-timeline"], WELCOME_TOUR_LABEL)}
      onTourComplete={onReturnToJobs}
      locale={{ last: "Got it" }}
      options={{
        buttons: ["primary", "skip"],
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
