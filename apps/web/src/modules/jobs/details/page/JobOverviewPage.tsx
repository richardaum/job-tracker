"use client";

import { cn } from "@job-tracker/ui";

import { OverviewTabContent } from "@/modules/jobs/details/components/OverviewTabContent";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

type JobOverviewPageProps = { jobId: string };
export function JobOverviewPage({ jobId }: JobOverviewPageProps) {
  const { enqueueToast } = useToastQueue();
  // TODO: consume job data from JobDetailsContext instead of calling
  // useJobDetailsViewModel() here (see TODO in that hook).
  const { job, sourcePrimaryText } = useJobDetailsViewModel(jobId, { includeStageEvents: false });

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
