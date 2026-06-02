"use client";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type SourceTabProps = { jobId: string; sidePanel?: string | null };

export function SourceTab({ jobId, sidePanel }: SourceTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/source`, { sidePanel });
  return (
    <DetailsTabTrigger tab="source" href={href}>
      Source content
    </DetailsTabTrigger>
  );
}
