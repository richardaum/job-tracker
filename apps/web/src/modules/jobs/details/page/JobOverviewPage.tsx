"use client";

import { cn } from "@job-tracker/ui";
import type { Route } from "next";

import { OverviewTabContent } from "@/modules/jobs/details/components/OverviewTabContent";
import { useJobDetailsContext } from "@/modules/jobs/details/hooks/useJobDetailsContext";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { WelcomeTourJobDetails } from "@/modules/welcome-tour/WelcomeTourJobDetails";
import { useTour } from "@/modules/welcome-tour/useTour";

type JobOverviewPageProps = { jobId: string };
export function JobOverviewPage({ jobId }: JobOverviewPageProps) {
  const { enqueueToast } = useToastQueue();
  const { job, sourcePrimaryText } = useJobDetailsContext();
  const readOnly = useJobDataSource() === "local";
  const { activeStepId } = useTour();

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
        readOnly={readOnly}
        forceVisibleAction={activeStepId === "job-field-actions" ? "title" : undefined}
        onSuccess={(message) => showToast(message ?? "", "success")}
        onError={(message) => showToast(message ?? "", "error")}
      />
      <WelcomeTourJobDetails descriptionHref={`/jobs/${jobId}/description` as Route} />
    </div>
  );
}
