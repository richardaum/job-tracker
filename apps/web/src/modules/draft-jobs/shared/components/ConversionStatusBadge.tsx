"use client";

import { Badge, cn, Spinner, Tooltip } from "@job-tracker/ui";
import React from "react";

function formatConversionStatus(status: string | null | undefined): string {
  if (!status) return "Idle";
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "Processing";
  if (normalized === "succeeded") return "Succeeded";
  if (normalized === "failed") return "Failed";
  return "Idle";
}

function conversionStatusBadgeIntent(
  status: string | null | undefined,
): "default" | "success" | "warning" | "error" {
  if (!status) return "default";
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "warning";
  if (normalized === "succeeded") return "success";
  if (normalized === "failed") return "error";
  return "default";
}

interface ConversionMetadataLike {
  status?: string | null;
  error?: string | null;
  timestamp?: string | null;
}

interface ConversionStatusBadgeProps {
  conversionMetadata?: ConversionMetadataLike | null;
  showSpinner?: boolean;
  className?: string;
}

export function ConversionStatusBadge({
  conversionMetadata,
  showSpinner = false,
  className,
}: ConversionStatusBadgeProps) {
  const status = conversionMetadata?.status;
  const error = conversionMetadata?.error;
  return (
    <Tooltip content={error ?? undefined} enabled={Boolean(error)}>
      <span className={cn("inline-flex items-center")}>
        <Badge
          intent={conversionStatusBadgeIntent(status)}
          className={cn("whitespace-nowrap gap-1.5", className)}
        >
          {formatConversionStatus(status)}
          {showSpinner ? <Spinner size="sm" /> : null}
        </Badge>
      </span>
    </Tooltip>
  );
}
