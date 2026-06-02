"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import type { Route } from "next";

import { getFillStatusTooltipContent } from "@/modules/jobs/details/components/fill-status.shared";
import { useJobFillStatus } from "@/modules/jobs/details/hooks/useJobFillStatus";

import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type OverviewTabProps = { jobId: string; sidePanel?: string | null };

export function OverviewTab({ jobId, sidePanel }: OverviewTabProps) {
  const href: Route = sidePanel != null ? (`/jobs/${jobId}?s=${sidePanel}` as Route) : (`/jobs/${jobId}` as Route);
  const { status, error } = useJobFillStatus();
  const tooltipContent = status ? getFillStatusTooltipContent(status, error) : "";

  return (
    <DetailsTabTrigger tab="overview" href={href}>
      <Tooltip content={tooltipContent} side="bottom" enabled={!!status}>
        <span className={cn("-mx-3 inline-flex min-h-8 items-center gap-1.5 px-3")}>
          Overview
          {status && <MatchStatusBadge status={status} />}
        </span>
      </Tooltip>
    </DetailsTabTrigger>
  );
}
