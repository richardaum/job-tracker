"use client";

import type { Route } from "next";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type HistoryTabProps = { jobId: string; fullWidth?: boolean };

export function HistoryTab({ jobId, fullWidth }: HistoryTabProps) {
  const href = fullWidth ? (`/jobs/${jobId}/history?w=full` as Route) : (`/jobs/${jobId}/history` as Route);
  return (
    <DetailsTabTrigger tab="history" href={href}>
      History
    </DetailsTabTrigger>
  );
}
