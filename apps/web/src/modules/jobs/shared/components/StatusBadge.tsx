"use client";

import { Badge, cn, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";

import { ApplicationStage } from "@/gql/hooks";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";

function getStageBadgeIntent(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Draft:
      return "default" as const;
    case ApplicationStage.Offer:
      return "success" as const;
    case ApplicationStage.Rejected:
      return "error" as const;
    case ApplicationStage.Technical:
      return "info" as const;
    case ApplicationStage.CulturalFit:
      return "info" as const;
    case ApplicationStage.RecruiterScreen:
      return "warning" as const;
    case ApplicationStage.Duplicated:
      return "warning" as const;
    default:
      return "default" as const;
  }
}

type StatusBadgeProps = { stage: ApplicationStage; reason?: string | null; className?: string };

export function StatusBadge({ stage, reason, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1")}>
      <Badge intent={getStageBadgeIntent(stage)} className={className}>
        {formatStage(stage)}
      </Badge>
      {reason ? (
        <Tooltip content={reason} side="bottom">
          <span
            className={cn("inline-flex cursor-help text-text-muted hover:text-text-secondary")}
            aria-label="Status reason"
          >
            <InfoIcon size={12} weight="regular" />
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}
