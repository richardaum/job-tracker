"use client";

import { useFeatureFlagEnabled } from "posthog-js/react";
import { ACTIONS } from "react-joyride";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import { WelcomeTourJoyride } from "@/modules/welcome-tour/WelcomeTourJoyride";
import {
  WELCOME_TOUR_FEATURE_FLAG,
  WELCOME_TOUR_LABEL,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";

type WelcomeTourStatusHistoryProps = { onOpenStatusHistory: () => void; onReturnToJobs: () => void };

/** Completes the welcome tour by opening the Status tab, then highlighting the scheduled event. */
export function WelcomeTourStatusHistory({ onOpenStatusHistory, onReturnToJobs }: WelcomeTourStatusHistoryProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activePhase } = useWelcomeTour();

  if (welcomeTourEnabled !== true || activePhase !== "status-history") {
    return null;
  }

  return (
    <WelcomeTourJoyride
      run
      continuous
      steps={pickWelcomeTourSteps(["status-panel-tab", "update-status-timeline"], WELCOME_TOUR_LABEL, {
        "status-panel-tab": {
          after: ({ action }) => {
            if (action === ACTIONS.NEXT) onOpenStatusHistory();
          },
        },
      })}
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
