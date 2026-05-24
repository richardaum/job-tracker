"use client";

import { cn } from "@job-tracker/ui";

import { MatchTabContent } from "@/modules/jobs/details/components/MatchTabContent";

export function JobMatchPage({ jobId }: { jobId: string }) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-auto px-2")}>
      <MatchTabContent jobId={jobId} />
    </div>
  );
}
