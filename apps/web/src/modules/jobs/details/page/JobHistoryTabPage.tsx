"use client";

import { cn } from "@job-tracker/ui";

import { HistoryPanel } from "@/modules/jobs/details/components/HistoryPanel";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

type JobHistoryTabPageProps = { jobId: string };
export function JobHistoryTabPage({ jobId }: JobHistoryTabPageProps) {
  const { enqueueToast } = useToastQueue();

  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <HistoryPanel
        jobId={jobId}
        onSuccess={(message) =>
          enqueueToast({ title: message, intent: "success" })
        }
        onError={(message) => enqueueToast({ title: message, intent: "error" })}
      />
    </div>
  );
}
