"use client";

import { cn } from "@job-tracker/ui";

import { OverviewTabContent } from "@/modules/jobs/details/components/OverviewTabContent";
import { useJobDetailsContext } from "@/modules/jobs/details/hooks/useJobDetailsContext";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

type JobOverviewPageProps = { jobId: string };
export function JobOverviewPage({ jobId: _jobId }: JobOverviewPageProps) {
  const { enqueueToast } = useToastQueue();
  const { job, sourcePrimaryText } = useJobDetailsContext();

  if (!job) {
    return null;
  }

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-auto px-2")}>
      <OverviewTabContent
        job={job}
        sourcePrimaryText={sourcePrimaryText}
        onSuccess={(message) => showToast(message ?? "", "success")}
        onError={(message) => showToast(message ?? "", "error")}
      />
    </div>
  );
}
