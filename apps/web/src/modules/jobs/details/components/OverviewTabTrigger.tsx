"use client";

import { cn, TabsTrigger, Tooltip } from "@job-tracker/ui";
import type { Route } from "next";
import NextLink from "next/link";

import { getFillStatusTooltipContent } from "@/modules/jobs/details/components/fill-status.shared";
import { useJobFillStatus } from "@/modules/jobs/details/hooks/useJobFillStatus";
import type {
  JobDetailsMainTab,
  JobDetailsTab,
} from "@/modules/jobs/details/utils/job-details-routes";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";

interface OverviewTabTriggerProps {
  tab: JobDetailsMainTab | JobDetailsTab;
  href: Route;
  label?: string;
}

type OverviewTabLabelProps = {
  label: string;
  status: string | null | undefined;
};

function OverviewTabLabel({ label, status }: OverviewTabLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5")}>
      {label}
      {status ? <MatchStatusBadge status={status} /> : null}
    </span>
  );
}

export function OverviewTabTrigger({
  tab,
  href,
  label = "Overview",
}: OverviewTabTriggerProps) {
  const { status, error } = useJobFillStatus();
  const tooltipContent = status
    ? getFillStatusTooltipContent(status, error)
    : "";

  return (
    <TabsTrigger value={tab} asChild>
      <NextLink href={href}>
        {status ? (
          <Tooltip content={tooltipContent} side="bottom">
            <span
              className={cn(
                "-mx-3 inline-flex min-h-8 items-center gap-1.5 px-3",
              )}
            >
              <OverviewTabLabel label={label} status={status} />
            </span>
          </Tooltip>
        ) : (
          <OverviewTabLabel label={label} status={status} />
        )}
      </NextLink>
    </TabsTrigger>
  );
}
