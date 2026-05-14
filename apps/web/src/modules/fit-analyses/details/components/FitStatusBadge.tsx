"use client";

import { Badge, cn, Spinner, Tooltip } from "@job-tracker/ui";
import React from "react";

const STATUS_LABEL: Record<string, string> = {
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const STATUS_INTENT: Record<string, "warning" | "success" | "error"> = {
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

interface FitStatusBadgeProps {
  status: string;
  error?: string | null;
  className?: string;
}

export function FitStatusBadge({
  status,
  error,
  className,
}: FitStatusBadgeProps) {
  const isProcessing = status === "PROCESSING";
  const hasError = status === "FAILED" && Boolean(error);

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
