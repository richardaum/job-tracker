"use client";

import { ACTIONS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/welcome-tour/useTour";

type WelcomeTourJobDetailsProps = { descriptionHref: Route };

export function WelcomeTourJobDetails({ descriptionHref }: WelcomeTourJobDetailsProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const router = useRouter();
  const { activeTour, setActiveStepId } = useTour();

  useEffect(() => () => setActiveStepId(null), [setActiveStepId]);

  if (welcomeTourEnabled !== true || activeTour?.id !== "welcome-tour") return null;

  const steps = pickWelcomeTourSteps(
    ["job-detail-title", "job-status", "job-company", "job-field-actions", "job-description-tab"],
    WELCOME_TOUR_LABEL,
    {
      "job-field-actions": {
        before: async () => setActiveStepId("job-field-actions"),
        after: () => setActiveStepId(null),
      },
      "job-description-tab": {
        after: ({ action }) => {
          if (action === ACTIONS.NEXT) router.push(descriptionHref);
        },
      },
    },
  );

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
