"use client";

import type { TooltipRenderProps } from "react-joyride";
import { cn } from "@job-tracker/ui";

export function OnboardingTooltip({
  backProps,
  index,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const isPrimaryDisabled = step.data?.disablePrimary === true;
  const stepNumber = step.data?.stepNumber ?? index + 1;
  const totalSteps = step.data?.totalSteps ?? size;
  const isGlobalLastStep = stepNumber === totalSteps;
  const primaryLabel = isGlobalLastStep ? primaryProps.title : "Next";

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
          {stepNumber} of {totalSteps}
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
            {primaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
