"use client";

import { Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  NEW_JOB_WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";

export function WelcomeTourJobDetails() {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);

  if (welcomeTourEnabled !== true) return null;

  const steps = pickWelcomeTourSteps(["job-detail-title"], NEW_JOB_WELCOME_TOUR_LABEL);

  return (
    <Joyride
      run
      continuous
      steps={steps}
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
