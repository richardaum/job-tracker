"use client";

import { cn } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SourceContentTabContent } from "@/modules/jobs/details/components/SourceContentTabContent";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";

type JobSourcePageProps = { jobId: string };
export function JobSourcePage({ jobId }: JobSourcePageProps) {
  const router = useRouter();
  // TODO: consume job data from JobDetailsContext instead of calling
  // useJobDetailsViewModel() here (see TODO in that hook).
  const { job } = useJobDetailsViewModel(jobId, { includeStageEvents: false });

  useEffect(() => {
    if (job && !job.htmlContent) {
      router.replace(`/jobs/${jobId}`);
    }
  }, [job, jobId, router]);

  if (!job?.htmlContent) {
    return null;
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-hidden")}>
      <SourceContentTabContent htmlContent={job.htmlContent} />
    </div>
  );
}
