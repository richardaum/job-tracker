"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import type { Route } from "next";

import { useJobMatchStatus } from "@/modules/jobs/details/hooks/useJobMatchStatus";
import type { JobSidePanel } from "@/modules/jobs/details/utils/job-details-routes";
import { jobDetailsHref, jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";
import { getMatchStatusTooltipContent } from "@/modules/match-analyses/details/components/match-status.shared";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type MatchTabProps = { jobId: string; sidePanel?: JobSidePanel | null };

export function MatchTab({ jobId, sidePanel }: MatchTabProps) {
  const href: Route = sidePanel != null ? jobDetailsHref(jobId, "match", sidePanel) : jobDetailsPath(jobId, "match");
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
