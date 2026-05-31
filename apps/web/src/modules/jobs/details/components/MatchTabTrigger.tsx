"use client";

import { cn, TabsTrigger, Tooltip } from "@job-tracker/ui";
import type { Route } from "next";
import NextLink from "next/link";

import { useJobMatchStatus } from "@/modules/jobs/details/hooks/useJobMatchStatus";
import type { JobDetailsMainTab, JobDetailsTab } from "@/modules/jobs/details/utils/job-details-routes";
import { getMatchStatusTooltipContent } from "@/modules/match-analyses/details/components/match-status.shared";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

interface MatchTabTriggerProps {
  tab: JobDetailsMainTab | JobDetailsTab;
  href: Route;
  label?: string;
}

type MatchTabLabelProps = { label: string; status: string | null | undefined };

function MatchTabLabel({ label, status }: MatchTabLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5")}>
      {label}
      {status ? <MatchStatusBadge status={status} /> : null}
    </span>
  );
}

export function MatchTabTrigger({ tab, href, label = "Match" }: MatchTabTriggerProps) {
  const { status, error } = useJobMatchStatus();
  const tooltipContent = status ? getMatchStatusTooltipContent(status, error) : "";

  return (
    <TabsTrigger value={tab} asChild>
      <NextLink href={href}>
        {status ? (
          <Tooltip content={tooltipContent} side="bottom">
            <span className={cn("-mx-3 inline-flex min-h-8 items-center gap-1.5 px-3")}>
              <MatchTabLabel label={label} status={status} />
            </span>
          </Tooltip>
        ) : (
          <MatchTabLabel label={label} status={status} />
        )}
      </NextLink>
    </TabsTrigger>
  );
}
