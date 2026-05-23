"use client";

import { cn } from "@job-tracker/ui";
import type { ReactNode } from "react";

const DEFAULT_STACK = "gap-2";
/** Keeps breadcrumbs / headings from sitting under pinned actions */
const DEFAULT_RESERVE = "pe-36 sm:pe-44";

export interface DetailPageHeaderProps {
  children: ReactNode;
  /**
   * Pinned top-end of the header, outside document flow — does not affect
   * line metrics of breadcrumbs or titles (see ProfileShell layout).
   */
  trailing?: ReactNode | undefined;
  /** Spacing between stacked sections inside the padded flow (breadcrumb, title, …). */
  stackClassName?: string;
  className?: string;
  /** Overrides default reserved inline-end space when trailing is set. */
  reserveClassName?: string;
}

export function DetailPageHeader({
  children,
  trailing,
  stackClassName = DEFAULT_STACK,
  className,
  reserveClassName = DEFAULT_RESERVE,
}: DetailPageHeaderProps) {
  const hasTrailing = trailing != null;

  return (
    <div
      className={cn(
        "relative isolate border-b border-border-subtle p-4 sm:px-6 sm:py-5",
        className,
      )}
    >
      {hasTrailing ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-e-4 top-4 z-1 sm:inset-e-6 sm:top-5",
          )}
        >
          <div
            className={cn(
              "pointer-events-auto flex shrink-0 items-start justify-end gap-2",
            )}
          >
            {trailing}
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          "flex flex-col",
          stackClassName,
          hasTrailing ? reserveClassName : undefined,
        )}
      >
        {children}
      </div>
    </div>
  );
}
