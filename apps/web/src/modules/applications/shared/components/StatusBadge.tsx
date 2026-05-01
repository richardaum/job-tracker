"use client";

import { Badge, cn, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";
import React from "react";

import { ApplicationStage } from "@/gql/hooks";

function getStageBadgeIntent(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Offer:
      return "success" as const;
    case ApplicationStage.Rejected:
      return "error" as const;
    case ApplicationStage.Technical:
      return "info" as const;
    case ApplicationStage.RecruiterScreen:
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export function formatStage(value: ApplicationStage) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusBadge({
  stage,
  reason,
  className,
}: {
  stage: ApplicationStage;
  reason?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1")}>
      <Badge
        intent={getStageBadgeIntent(stage)}
        className={cn(
          "rounded border border-current/20 px-1.5 py-0.5 text-[11px] font-normal leading-4",
          className,
        )}
      >
        {formatStage(stage)}
      </Badge>
      {reason ? (
        <Tooltip content={reason} side="top">
          <span
            className={cn(
              "inline-flex cursor-help text-text-muted hover:text-text-secondary",
            )}
            aria-label="Status reason"
          >
            <InfoIcon size={12} weight="regular" />
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}
