"use client";

import { Badge, cn, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";
import React from "react";

import { JobStage } from "@/gql/hooks";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";

function getStageBadgeIntent(stage: JobStage) {
  switch (stage) {
    case JobStage.Offer:
      return "success" as const;
    case JobStage.Rejected:
      return "error" as const;
    case JobStage.Technical:
      return "info" as const;
    case JobStage.CulturalFit:
      return "info" as const;
    case JobStage.RecruiterScreen:
      return "warning" as const;
    case JobStage.Duplicated:
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export function StatusBadge({
  stage,
  reason,
  className,
}: {
  stage: JobStage;
  reason?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1")}>
      <Badge intent={getStageBadgeIntent(stage)} className={className}>
        {formatStage(stage)}
      </Badge>
      {reason ? (
        <Tooltip content={reason} side="bottom">
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
