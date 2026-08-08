"use client";

import { cn } from "@job-tracker/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OverviewTabContent } from "@/modules/jobs/details/components/OverviewTabContent";
import { useJobDetailsContext } from "@/modules/jobs/details/hooks/useJobDetailsContext";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { WelcomeTourJobDetails } from "@/modules/welcome-tour/WelcomeTourJobDetails";

type JobOverviewPageProps = { jobId: string };
export function JobOverviewPage({ jobId }: JobOverviewPageProps) {
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const { job, openStatusDialog, sourcePrimaryText } = useJobDetailsContext();
  const readOnly = useJobDataSource() === "local";
  const [forceVisibleAction, setForceVisibleAction] = useState<string>();

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
        forceVisibleAction={forceVisibleAction}
        onSuccess={(message) => showToast(message ?? "", "success")}
        onError={(message) => showToast(message ?? "", "error")}
      />
      <WelcomeTourJobDetails
        onFieldActionsVisibilityChange={(visible) => setForceVisibleAction(visible ? "title" : undefined)}
        onDescriptionOpen={() => router.push(`/jobs/${jobId}/description` as Route)}
        onUpdateStatus={openStatusDialog}
      />
    </div>
  );
}
