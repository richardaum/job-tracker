"use client";

import { cn, Tooltip } from "@job-tracker/ui";

import { useJobMatchStatus } from "@/modules/jobs/details/hooks/useJobMatchStatus";

import { getMatchStatusTooltipContent } from "@/modules/match-analyses/details/components/match-status.shared";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";
import { DetailsTabTrigger } from "./DetailsTabTrigger";

type MatchTabProps = { jobId: string; sidePanel?: string | null };

export function MatchTab({ jobId, sidePanel }: MatchTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/match`, { sidePanel });
  const { status, error } = useJobMatchStatus();
  const tooltipContent = status ? getMatchStatusTooltipContent(status, error) : "";

  return (
    <DetailsTabTrigger tab="match" href={href}>
      <Tooltip content={tooltipContent} side="bottom" enabled={!!status}>
        <span className={cn("-mx-3 inline-flex min-h-8 items-center gap-1.5 px-3")}>
          Match
          {status && <MatchStatusBadge status={status} />}
        </span>
      </Tooltip>
    </DetailsTabTrigger>
  );
}
