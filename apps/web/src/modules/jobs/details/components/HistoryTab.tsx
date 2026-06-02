"use client";

import { jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type HistoryTabProps = { jobId: string };

export function HistoryTab({ jobId }: HistoryTabProps) {
  return (
    <DetailsTabTrigger tab="history" href={jobDetailsPath(jobId, "history")}>
      History
    </DetailsTabTrigger>
  );
}
