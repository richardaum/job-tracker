import { cn } from "@job-tracker/ui";

import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

import { DescriptionEditor } from "./DescriptionEditor";

type DescriptionTabContentProps = { job: JobDetailsValues; onSuccess: () => void; onError: () => void };

export function DescriptionTabContent({ job, onSuccess, onError }: DescriptionTabContentProps) {
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
