"use client";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type DescriptionTabProps = { jobId: string; sidePanel?: string | null };

export function DescriptionTab({ jobId, sidePanel }: DescriptionTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/description`, { sidePanel });
  return (
    <DetailsTabTrigger tab="description" href={href} data-welcome-tour-step="job-description-tab">
      Description
    </DetailsTabTrigger>
  );
}
