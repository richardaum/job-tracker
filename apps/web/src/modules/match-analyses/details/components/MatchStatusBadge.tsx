"use client";

import { cn } from "@job-tracker/ui";

import { AsyncMetadataStatus } from "@/gql/hooks";

import { MATCH_STATUS_DOT_CLASS, MATCH_STATUS_PROCESSING_PULSE_CLASS } from "./match-status.shared";

interface MatchStatusBadgeProps {
  status: string | AsyncMetadataStatus;
  className?: string;
}

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  const isProcessing = status === AsyncMetadataStatus.Processing;

  return (
    <span
      aria-hidden
      data-testid="match-status-badge"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        MATCH_STATUS_DOT_CLASS[status] ?? "bg-text-muted",
        isProcessing && MATCH_STATUS_PROCESSING_PULSE_CLASS,
        className,
      )}
    />
  );
}
