"use client";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type NotesTabProps = { jobId: string; fullWidth?: boolean };

export function NotesTab({ jobId, fullWidth }: NotesTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/notes`, { fullWidth });
  return (
    <DetailsTabTrigger tab="notes" href={href}>
      Notes
    </DetailsTabTrigger>
  );
}
