"use client";

import { cn, Tooltip } from "@job-tracker/ui";

import { getFillStatusTooltipContent } from "@/modules/jobs/details/components/fill-status.shared";
import { useJobFillStatus } from "@/modules/jobs/details/hooks/useJobFillStatus";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type OverviewTabProps = { jobId: string; sidePanel?: string | null };

export function OverviewTab({ jobId, sidePanel }: OverviewTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}`, { sidePanel });
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
