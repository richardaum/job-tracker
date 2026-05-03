import { cn } from "@ui/lib/cn";
import React from "react";

export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

export interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return <div className={cn("flex gap-3", className)}>{children}</div>;
}

export interface TimelineMarkerProps {
  showTopConnector?: boolean;
  showBottomConnector?: boolean;
  dotClassName?: string;
  className?: string;
  topConnectorClassName?: string;
  bottomConnectorClassName?: string;
}

export function TimelineMarker({
  showTopConnector = false,
  showBottomConnector = false,
  dotClassName,
  className,
  topConnectorClassName,
  bottomConnectorClassName,
}: TimelineMarkerProps) {
  return (
    <div
      className={cn(
        "relative flex w-4 shrink-0 items-center justify-center",
        className,
      )}
      role="presentation"
    >
      {showTopConnector ? (
        <span
          className={cn(
            "absolute bottom-[calc(50%+16px)] left-1/2 top-0 w-px -translate-x-1/2 bg-border-subtle",
            topConnectorClassName,
          )}
        />
      ) : null}
      <span
        className={cn(
          "block h-2.5 w-2.5 shrink-0 rounded-full bg-current",
          dotClassName,
        )}
      />
      {showBottomConnector ? (
        <span
          className={cn(
            "absolute -bottom-3 left-1/2 top-[calc(50%+16px)] w-px -translate-x-1/2 bg-border-subtle",
            bottomConnectorClassName,
          )}
        />
      ) : null}
    </div>
  );
}

export interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div
      className={cn(
        "flex-1 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
