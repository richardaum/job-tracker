"use client";

import { Badge, cn, Spinner, Tooltip } from "@job-tracker/ui";
import React from "react";

import { AsyncMetadataStatus } from "@/gql/hooks";

const STATUS_LABEL: Record<string, string> = {
  [AsyncMetadataStatus.Processing]: "Processing",
  [AsyncMetadataStatus.Completed]: "Completed",
  [AsyncMetadataStatus.Failed]: "Failed",
};

const STATUS_INTENT: Record<string, "warning" | "success" | "error"> = {
  [AsyncMetadataStatus.Processing]: "warning",
  [AsyncMetadataStatus.Completed]: "success",
  [AsyncMetadataStatus.Failed]: "error",
};

interface FitStatusBadgeProps {
  status: string | AsyncMetadataStatus;
  error?: string | null;
  className?: string;
}

export function FitStatusBadge({
  status,
  error,
  className,
}: FitStatusBadgeProps) {
  const isProcessing = status === AsyncMetadataStatus.Processing;
  const hasError = status === AsyncMetadataStatus.Failed && Boolean(error);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Tooltip content={error ?? ""} side="bottom" enabled={hasError}>
        <Badge
          intent={STATUS_INTENT[status] ?? "default"}
          className={cn("gap-1.5")}
        >
          {STATUS_LABEL[status] ?? status}
        </Badge>
      </Tooltip>
      {isProcessing ? <Spinner size="sm" /> : null}
    </span>
  );
}
