"use client";

import { cn } from "@job-tracker/ui";

import { MatchTabContent } from "@/modules/jobs/details/components/MatchTabContent";

type JobMatchPageProps = { jobId: string };
export function JobMatchPage({ jobId }: JobMatchPageProps) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-auto pr-2 pb-2")}>
      <MatchTabContent jobId={jobId} />
    </div>
  );
}
