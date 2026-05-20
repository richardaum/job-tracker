import { cn } from "@job-tracker/ui";
import React from "react";

import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

import { DescriptionEditor } from "./DescriptionEditor";

export function DescriptionTabContent({
  job,
  onSuccess,
  onError,
}: {
  job: JobDetailsValues;
  onSuccess: () => void;
  onError: () => void;
}) {
  return (
    <div className={cn("h-full min-h-0")}>
      <DescriptionEditor
        key={job.id}
        jobId={job.id}
        initialDescription={job.description}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
}
