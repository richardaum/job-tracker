"use client";

import { Badge, cn, Spinner, Tooltip } from "@job-tracker/ui";
import React from "react";

import { FitAnalysisStatus } from "@/gql/hooks";

const STATUS_LABEL: Record<string, string> = {
  [FitAnalysisStatus.Processing]: "Processing",
  [FitAnalysisStatus.Completed]: "Completed",
  [FitAnalysisStatus.Failed]: "Failed",
};

const STATUS_INTENT: Record<string, "warning" | "success" | "error"> = {
  [FitAnalysisStatus.Processing]: "warning",
  [FitAnalysisStatus.Completed]: "success",
  [FitAnalysisStatus.Failed]: "error",
};

interface FitStatusBadgeProps {
  status: string | FitAnalysisStatus;
  error?: string | null;
  className?: string;
}

export function FitStatusBadge({
  status,
  error,
  className,
}: FitStatusBadgeProps) {
  const isProcessing = status === FitAnalysisStatus.Processing;
  const hasError = status === FitAnalysisStatus.Failed && Boolean(error);

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
