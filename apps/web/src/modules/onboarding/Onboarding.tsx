"use client";

import type { ReactNode } from "react";
import type { EventData, Step, TooltipRenderProps } from "react-joyride";
import { ACTIONS, EVENTS, Joyride } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { cn } from "@job-tracker/ui";

export interface OnboardingProps {
  tourLabel?: ReactNode;
  onOpenNewJob?: () => void;
  onCloseNewJob?: () => void;
  onFocusJobField?: (field: "title" | "company") => void;
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void;
  isJobTitleFilled?: boolean;
  isJobCompanyFilled?: boolean;
}

const DEFAULT_TOUR_LABEL = "Guided tour";

export function Onboarding({
  tourLabel = DEFAULT_TOUR_LABEL,
  onOpenNewJob,
  onCloseNewJob,
  onFocusJobField,
  onJobFormStepChange,
  isJobTitleFilled = false,
  isJobCompanyFilled = false,
}: OnboardingProps) {
  const onboardingEnabled = useFeatureFlagEnabled("onboarding-enabled");

  if (onboardingEnabled !== true) return null;

  return (
    <Joyride
      run
      continuous
      steps={getOnboardingSteps(
        tourLabel,
        onOpenNewJob,
        onCloseNewJob,
        onJobFormStepChange,
        isJobTitleFilled,
        isJobCompanyFilled,
      )}
      onEvent={(event) => handleOnboardingEvent(event, onJobFormStepChange, onFocusJobField)}
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
  const isPrimaryDisabled = step.data?.disablePrimary === true;

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
            {...primaryProps}
            className={cn(
              "rounded-md border border-transparent bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-inverted shadow-sm transition-colors hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-brand",
            )}
            type="button"
            disabled={isPrimaryDisabled}
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
  onCloseNewJob?: () => void,
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void,
  isJobTitleFilled = false,
  isJobCompanyFilled = false,
): Step[] {
  const steps: Array<Omit<Step, "title">> = [
    {
      target: "body",
      placement: "center",
      content: (
        <p>
          Welcome to Job Tracker! This onboarding will guide you through the main features of the application. <br />
          Don't worry about using real data—everything you enter is just for this tutorial.
        </p>
      ),
    },
    {
      target: '[data-onboarding-step="new-job-button"]',
      placement: "bottom",
      content: "Click here to create a new job application.",
    },
    {
      target: '[data-onboarding-step="job-title-input"]',
      placement: "bottom",
      content: "Start by giving this application a title.",
      disableFocusTrap: true,
      data: { disablePrimary: !isJobTitleFilled },
      targetWaitTimeout: 2_000,
      before: async () => {
        onOpenNewJob?.();
        onJobFormStepChange?.("title");
      },
      after: ({ action }) => {
        onJobFormStepChange?.(null);
        if (action === ACTIONS.PREV) onCloseNewJob?.();
      },
    },
    {
      target: '[data-onboarding-step="job-company-input"]',
      placement: "bottom",
      content: "Next, choose the company for this application.",
      disableFocusTrap: true,
      data: { disablePrimary: !isJobCompanyFilled },
      before: async () => {
        onJobFormStepChange?.("company");
      },
      after: () => onJobFormStepChange?.(null),
    },
    {
      target: '[data-onboarding-step="create-job-button"]',
      placement: "top",
      content: "Everything looks good. Click Create to add this job to your tracker.",
      disableFocusTrap: true,
      targetWaitTimeout: 2_000,
      before: async () => {
        onJobFormStepChange?.("create");
      },
      after: () => onJobFormStepChange?.(null),
    },
  ];

  return steps.map((step) => ({ ...step, title: tourLabel }));
}

function handleOnboardingEvent(
  event: EventData,
  onJobFormStepChange?: (step: "title" | "company" | "create" | null) => void,
  onFocusJobField?: (field: "title" | "company") => void,
) {
  if (event.type === EVENTS.TOOLTIP && event.index === 2) onFocusJobField?.("title");
  if (event.type === EVENTS.TOOLTIP && event.index === 3) onFocusJobField?.("company");
  if (event.type === EVENTS.TOUR_END) onJobFormStepChange?.(null);
}
