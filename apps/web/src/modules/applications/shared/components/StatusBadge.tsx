"use client";

import React from "react";
import { Badge, cn } from "@job-tracker/ui";
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
  className,
}: {
  stage: ApplicationStage;
  className?: string;
}) {
  return (
    <Badge
      intent={getStageBadgeIntent(stage)}
      className={cn(
        "rounded-md border border-current/20 px-1.5 py-0.5 text-[11px] font-normal leading-4",
        className,
      )}
    >
      {formatStage(stage)}
    </Badge>
  );
}
