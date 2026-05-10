"use client";

import { Badge, cn, Spinner, Tooltip } from "@job-tracker/ui";
import React from "react";

function formatConversionStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "Processing";
  if (normalized === "succeeded") return "Succeeded";
  if (normalized === "failed") return "Failed";
  return "Idle";
}

function conversionStatusBadgeIntent(
  status: string,
): "default" | "success" | "warning" | "error" {
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "warning";
  if (normalized === "succeeded") return "success";
  if (normalized === "failed") return "error";
  return "default";
}

interface ConversionStatusBadgeProps {
  conversionStatus: string;
  conversionError?: string | null;
  showSpinner?: boolean;
  className?: string;
}

export function ConversionStatusBadge({
  conversionStatus,
  conversionError,
  showSpinner = false,
  className,
}: ConversionStatusBadgeProps) {
  return (
    <Tooltip
      content={conversionError ?? undefined}
      enabled={Boolean(conversionError)}
    >
      <Badge
        intent={conversionStatusBadgeIntent(conversionStatus)}
        className={cn("whitespace-nowrap", className)}
      >
        {showSpinner ? (
          <span className={cn("inline-flex items-center gap-1.5")}>
            <Spinner size="sm" />
            {formatConversionStatus(conversionStatus)}
          </span>
        ) : (
          formatConversionStatus(conversionStatus)
        )}
      </Badge>
    </Tooltip>
  );
}
