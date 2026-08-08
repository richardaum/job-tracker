"use client";

import { ACTIONS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useTour } from "@/modules/welcome-tour/useTour";

/**
 * Continues the welcome tour on the Description route. It is deliberately a
 * separate Joyride instance because navigation unmounts the route content.
 */
type WelcomeTourJobDescriptionProps = { overviewHref: Route };

export function WelcomeTourJobDescription({ overviewHref }: WelcomeTourJobDescriptionProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const router = useRouter();
  const { activeTour, setActiveStepId } = useTour();

  if (welcomeTourEnabled !== true || activeTour?.id !== "welcome-tour") return null;

  return (
    <Joyride
      run
      continuous
      steps={pickWelcomeTourSteps(["job-description-editor"], WELCOME_TOUR_LABEL, {
        "job-description-editor": {
          after: ({ action }) => {
            if (action !== ACTIONS.NEXT) return;

            setActiveStepId("update-status-button");
            router.push(overviewHref);
          },
        },
      })}
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
