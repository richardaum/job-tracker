"use client";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type HistoryTabProps = { jobId: string; fullWidth?: boolean };

export function HistoryTab({ jobId, fullWidth }: HistoryTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/history`, { fullWidth });
  return (
    <DetailsTabTrigger tab="history" href={href} data-welcome-tour-step="status-panel-tab">
      History
    </DetailsTabTrigger>
  );
}
