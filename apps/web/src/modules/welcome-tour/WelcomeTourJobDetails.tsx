"use client";

import { ACTIONS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  NEW_JOB_WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useWelcomeTourSession } from "@/modules/welcome-tour/useWelcomeTourSession";

export function WelcomeTourJobDetails() {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const pathname = usePathname();
  const router = useRouter();
  const { activeWelcomeTour } = useWelcomeTourSession();

  if (welcomeTourEnabled !== true || !activeWelcomeTour || pathname.endsWith("/description")) return null;

  const steps = pickWelcomeTourSteps(["job-detail-title", "job-status", "job-company"], NEW_JOB_WELCOME_TOUR_LABEL, {
    "job-company": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) router.push(`${pathname}/description` as Route);
      },
    },
  });

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
