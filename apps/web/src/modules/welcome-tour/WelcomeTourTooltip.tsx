"use client";

import type { TooltipRenderProps } from "react-joyride";
import { cn } from "@job-tracker/ui";
import { useEffect } from "react";

export function WelcomeTourTooltip({
  backProps,
  controls,
  index,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const isPrimaryDisabled = step.data?.disablePrimary === true;
  const advancesOnEnter = step.data?.advanceOnEnter === true;
  const stepNumber = step.data?.stepNumber ?? index + 1;
  const totalSteps = step.data?.totalSteps ?? size;
  const isGlobalLastStep = stepNumber === totalSteps;
  const primaryLabel = isGlobalLastStep ? primaryProps.title : "Next";

  useEffect(() => {
    if (!advancesOnEnter || isPrimaryDisabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.isComposing ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      event.preventDefault();
      controls.next("keyboard");
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [advancesOnEnter, controls, isPrimaryDisabled]);

  return (
    <section
      className={cn(
        "w-[min(23rem,calc(100vw-2rem))] rounded-lg border border-border-subtle bg-bg-surface p-5 shadow-lg",
      )}
      {...tooltipProps}
      aria-label="Welcome tour"
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

      <div className={cn("mt-6 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2")}>
        {/* Joyride's focus trap follows DOM order; grid placement preserves the visual layout. */}
        <button
          {...primaryProps}
          className={cn(
            "col-start-3 row-start-1 rounded-md border border-transparent bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-inverted shadow-sm transition-colors hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-brand",
          )}
          type="button"
          disabled={isPrimaryDisabled}
        >
          {primaryLabel}
        </button>
        {index > 0 ? (
          <button
            className={cn(
              "col-start-2 row-start-1 cursor-pointer rounded-md border-[1.5px] border-border-default bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
            )}
            type="button"
            {...backProps}
          />
        ) : null}
        <button
          className={cn(
            "col-start-1 row-start-1 justify-self-start cursor-pointer rounded-md px-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
          )}
          type="button"
          {...skipProps}
        />
      </div>
    </section>
  );
}
