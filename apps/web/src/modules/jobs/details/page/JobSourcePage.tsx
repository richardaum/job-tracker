"use client";

import { cn } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SourceContentTabContent } from "@/modules/jobs/details/components/SourceContentTabContent";
import { useJobDetailsContext } from "@/modules/jobs/details/hooks/useJobDetailsContext";

type JobSourcePageProps = { jobId: string };
export function JobSourcePage({ jobId }: JobSourcePageProps) {
  const router = useRouter();
  const { job } = useJobDetailsContext();

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
