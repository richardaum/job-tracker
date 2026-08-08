"use client";

import { cn } from "@job-tracker/ui";
import type { Route } from "next";

import { DescriptionTabContent } from "@/modules/jobs/details/components/DescriptionTabContent";
import { useJobDetailsContext } from "@/modules/jobs/details/hooks/useJobDetailsContext";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { WelcomeTourJobDescription } from "@/modules/welcome-tour/WelcomeTourJobDescription";

type JobDescriptionPageProps = { jobId: string };
export function JobDescriptionPage({ jobId }: JobDescriptionPageProps) {
  const { enqueueToast } = useToastQueue();
  const { job } = useJobDetailsContext();

  if (!job) {
    return null;
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-auto")}>
      <DescriptionTabContent
        job={job}
        onError={() => enqueueToast({ title: "Failed to save description.", intent: "error" })}
      />
      <WelcomeTourJobDescription overviewHref={`/jobs/${jobId}` as Route} />
    </div>
  );
}
