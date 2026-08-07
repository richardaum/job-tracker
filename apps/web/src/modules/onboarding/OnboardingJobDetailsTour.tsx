"use client";

import { Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { OnboardingTooltip } from "@/modules/onboarding/OnboardingTooltip";
import { NEW_JOB_ONBOARDING_TOUR_LABEL, pickOnboardingSteps } from "@/modules/onboarding/onboardingSteps";

export function OnboardingJobDetailsTour() {
  const onboardingEnabled = useFeatureFlagEnabled("onboarding-enabled");

  if (onboardingEnabled !== true) return null;

  const steps = pickOnboardingSteps(["job-detail-title"], NEW_JOB_ONBOARDING_TOUR_LABEL);

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
      tooltipComponent={OnboardingTooltip}
    />
  );
}
