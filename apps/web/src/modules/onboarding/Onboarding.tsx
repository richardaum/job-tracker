"use client";

import type { ReactNode } from "react";
import type { EventData, Step, TooltipRenderProps } from "react-joyride";
import { EVENTS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { cn } from "@job-tracker/ui";

export interface OnboardingProps {
  tourLabel?: ReactNode;
  onOpenNewJob?: () => void;
  onJobTitleStepActiveChange?: (active: boolean) => void;
}

export function Onboarding({ tourLabel = "Guided tour", onOpenNewJob, onJobTitleStepActiveChange }: OnboardingProps) {
  const onboardingEnabled = useFeatureFlagEnabled("onboarding-enabled");

  if (onboardingEnabled !== true) return null;

  return (
    <Joyride
      run
      continuous
      steps={getOnboardingSteps(tourLabel, onOpenNewJob, onJobTitleStepActiveChange)}
      onEvent={(event) => handleOnboardingEvent(event, onJobTitleStepActiveChange)}
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
      styles={{ floater: { pointerEvents: "auto", zIndex: 1000 } }}
      tooltipComponent={OnboardingTooltip}
    />
  );
}

function OnboardingTooltip({
  backProps,
  index,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <section
      className={cn(
        "w-[min(23rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-lg",
      )}
      {...tooltipProps}
      aria-label="Onboarding"
    >
      <div className={cn("mb-4 flex items-center justify-between gap-3")}>
        <div className={cn("flex items-center gap-2 text-xs font-medium text-text-secondary")}>
          <span aria-hidden className={cn("size-2 rounded-full bg-bg-brand")} />
          {step.title}
        </div>
        <span className={cn("text-xs font-medium text-text-muted")}>
          {index + 1} of {size}
        </span>
      </div>

      <div className={cn("text-sm/relaxed text-text-primary")}>{step.content}</div>

      <div className={cn("mt-6 flex items-center justify-between gap-3")}>
        <button
          className={cn(
            "cursor-pointer rounded-md px-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
          )}
          type="button"
          {...skipProps}
        />
        <div className={cn("flex items-center gap-2")}>
          {index > 0 ? (
            <button
              className={cn(
                "cursor-pointer rounded-md border-[1.5px] border-border-default bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
              )}
              type="button"
              {...backProps}
            />
          ) : null}
          <button
            className={cn(
              "cursor-pointer rounded-md border border-transparent bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-inverted shadow-sm transition-colors hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
            )}
            type="button"
            {...primaryProps}
          >
            {primaryProps.title}
          </button>
        </div>
      </div>
    </section>
  );
}

function getOnboardingSteps(
  tourLabel: ReactNode,
  onOpenNewJob?: () => void,
  onJobTitleStepActiveChange?: (active: boolean) => void,
): Step[] {
  return [
    {
      target: "body",
      placement: "center",
      title: tourLabel,
      content: "Welcome to Job Tracker! This onboarding will guide you through the main features of the application.",
    },
    {
      target: '[data-onboarding-step="new-job-button"]',
      placement: "bottom",
      title: tourLabel,
      content: "Click here to create a new job application.",
    },
    {
      target: '[data-onboarding-step="job-title-input"]',
      placement: "bottom",
      title: tourLabel,
      content: "Start by giving this application a title.",
      disableFocusTrap: true,
      targetWaitTimeout: 2_000,
      before: async () => {
        onJobTitleStepActiveChange?.(true);
        onOpenNewJob?.();
      },
      after: () => onJobTitleStepActiveChange?.(false),
    },
    {
      target: '[data-onboarding-step="job-company-field"]',
      placement: "bottom",
      title: tourLabel,
      content: "Next, choose the company for this application.",
      disableFocusTrap: true,
      before: async () => {
        onJobTitleStepActiveChange?.(true);
      },
      after: () => onJobTitleStepActiveChange?.(false),
    },
  ];
}

function handleOnboardingEvent(event: EventData, onJobTitleStepActiveChange?: (active: boolean) => void) {
  if (event.type === EVENTS.TOUR_END) onJobTitleStepActiveChange?.(false);
}
