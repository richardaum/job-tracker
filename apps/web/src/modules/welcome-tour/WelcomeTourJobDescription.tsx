"use client";

import { Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  NEW_JOB_WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";

/**
 * Continues the welcome tour on the Description route. It is deliberately a
 * separate Joyride instance because navigation unmounts the route content.
 */
export function WelcomeTourJobDescription() {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);

  if (welcomeTourEnabled !== true) return null;

  return (
    <Joyride
      run
      continuous
      steps={pickWelcomeTourSteps(["job-description-editor"], NEW_JOB_WELCOME_TOUR_LABEL)}
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
