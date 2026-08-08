"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";

import { JoyrideSegmentedTour } from "@/modules/tour/JoyrideSegmentedTour";
import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/tour/useTour";

/**
 * Continues the welcome tour on the Description route. It is deliberately a
 * separate Joyride instance because navigation unmounts the route content.
 */
type WelcomeTourJobDescriptionProps = { onOverviewOpen: () => void };

export function WelcomeTourJobDescription({ onOverviewOpen }: WelcomeTourJobDescriptionProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activeTour } = useTour();

  if (welcomeTourEnabled !== true || activeTour?.id !== "welcome-tour" || activeTour.phase !== "job-description")
    return null;

  return (
    <JoyrideSegmentedTour
      run
      continuous
      steps={pickWelcomeTourSteps(["job-description-editor"], WELCOME_TOUR_LABEL)}
      onSegmentComplete={onOverviewOpen}
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
