"use client";

import { cn } from "@job-tracker/ui";

import { HistoryPanel } from "@/modules/jobs/details/components/HistoryPanel";

type JobHistoryTabPageProps = { jobId: string };
export function JobHistoryTabPage({ jobId }: JobHistoryTabPageProps) {
  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <HistoryPanel jobId={jobId} />
    </div>
  );
}
