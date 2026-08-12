"use client";

import type { ReactNode } from "react";
import type { EventData } from "react-joyride";
import type { Controls } from "react-joyride";
import { ACTIONS, EVENTS } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect, useRef } from "react";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import { WelcomeTourJoyride } from "@/modules/welcome-tour/WelcomeTourJoyride";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";

export interface WelcomeTourJobsListProps {
  tourLabel?: ReactNode;
  portalElement?: HTMLElement | null;
  onOpenNewJob?: () => void;
  onCloseNewJob?: () => void;
  onFocusJobField?: (field: "title" | "company") => void;
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void;
  onSubmitNewJob?: () => void;
  isJobTitleFilled?: boolean;
  isJobCompanyFilled?: boolean;
  isActiveFilterSelected?: boolean;
}

export function WelcomeTourJobsList({
  tourLabel = WELCOME_TOUR_LABEL,
  portalElement,
  onOpenNewJob,
  onCloseNewJob,
  onFocusJobField,
  onJobFormStepChange,
  onSubmitNewJob,
  isJobTitleFilled = false,
  isJobCompanyFilled = false,
  isActiveFilterSelected = false,
}: WelcomeTourJobsListProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activePhase, start } = useWelcomeTour();
  const tourControlsRef = useRef<Controls | null>(null);
  const isActiveQuickFilterStepActiveRef = useRef(false);
  const wasActiveFilterSelectedRef = useRef(isActiveFilterSelected);

  useEffect(() => {
    const wasActiveFilterSelected = wasActiveFilterSelectedRef.current;
    wasActiveFilterSelectedRef.current = isActiveFilterSelected;

    if (
      activePhase !== "jobs-list" ||
      !isActiveQuickFilterStepActiveRef.current ||
      wasActiveFilterSelected ||
      !isActiveFilterSelected
    ) {
      return;
    }

    isActiveQuickFilterStepActiveRef.current = false;
    tourControlsRef.current?.next();
  }, [activePhase, isActiveFilterSelected]);

  useEffect(() => {
    if (welcomeTourEnabled === true) start();
  }, [start, welcomeTourEnabled]);

  if (welcomeTourEnabled !== true || (activePhase !== "job-creation" && activePhase !== "jobs-list")) return null;

  const isJobsListSegment = activePhase === "jobs-list";
  const steps = isJobsListSegment
    ? pickWelcomeTourSteps(["active-jobs-filter", "active-jobs-list"], tourLabel, {
        "active-jobs-filter": { disablePrimary: !isActiveFilterSelected },
      })
    : pickWelcomeTourSteps(
        ["welcome", "new-job-button", "job-title-input", "job-company-input", "create-job-button"],
        tourLabel,
        {
          "job-title-input": {
            disablePrimary: !isJobTitleFilled,
            before: async () => {
              onOpenNewJob?.();
              onJobFormStepChange?.("title");
            },
            after: ({ action }) => {
              onJobFormStepChange?.(null);
              if (action === ACTIONS.PREV) onCloseNewJob?.();
            },
          },
          "job-company-input": {
            disablePrimary: !isJobCompanyFilled,
            before: async () => onJobFormStepChange?.("company"),
            after: () => onJobFormStepChange?.(null),
          },
          "create-job-button": {
            before: async () => onJobFormStepChange?.("create"),
            after: () => onJobFormStepChange?.(null),
          },
        },
      );

  return (
    <WelcomeTourJoyride
      run
      continuous
      steps={steps}
      portalElement={portalElement ?? undefined}
      onSegmentComplete={isJobsListSegment ? undefined : onSubmitNewJob}
      onEvent={(event, controls) => {
        tourControlsRef.current = controls;
        if (event.type === EVENTS.TOOLTIP) {
          isActiveQuickFilterStepActiveRef.current =
            event.step.target === '[data-welcome-tour-step="active-jobs-filter"]';
          if (isActiveQuickFilterStepActiveRef.current) focusActiveJobsFilter();
        }
        handleWelcomeTourEvent(event, onJobFormStepChange, onFocusJobField);
      }}
      options={{
        buttons: ["back", "primary", "skip"],
        skipBeacon: true,
        overlayColor: "var(--semantic-color-overlay-backdrop)",
        overlayClickAction: false,
        dismissKeyAction: false,
        spotlightPadding: 8,
        spotlightRadius: 10,
      }}
      floatingOptions={{ hideArrow: true }}
      styles={{
        floater: { pointerEvents: "auto", zIndex: 1000 },
        overlay: { position: portalElement ? "fixed" : "absolute" },
      }}
      tooltipComponent={WelcomeTourTooltip}
    />
  );
}

function handleWelcomeTourEvent(
  event: EventData,
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void,
  onFocusJobField?: (field: "title" | "company") => void,
) {
  if (event.type === EVENTS.TOOLTIP && event.index === 2) onFocusJobField?.("title");
  if (event.type === EVENTS.TOOLTIP && event.index === 3) onFocusJobField?.("company");
  if (event.type === EVENTS.TOUR_END) onJobFormStepChange?.(null);
}

function focusActiveJobsFilter() {
  document.querySelector<HTMLButtonElement>('[data-welcome-tour-step="active-jobs-filter"]')?.focus();
}
