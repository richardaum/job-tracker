"use client";

import { cn } from "@job-tracker/ui";

import { DescriptionTabContent } from "@/modules/jobs/details/components/DescriptionTabContent";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

export function JobDescriptionPage({ jobId }: { jobId: string }) {
  const { enqueueToast } = useToastQueue();
  const { job } = useJobDetailsViewModel(jobId, { includeStageEvents: false });

  if (!job) {
    return null;
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-auto")}>
      <DescriptionTabContent
        job={job}
        onSuccess={() =>
          enqueueToast({ title: "Description saved.", intent: "success" })
        }
        onError={() =>
          enqueueToast({
            title: "Failed to save description.",
            intent: "error",
          })
        }
      />
    </div>
  );
}
