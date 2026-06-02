"use client";

import { jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type NotesTabProps = { jobId: string };

export function NotesTab({ jobId }: NotesTabProps) {
  return (
    <DetailsTabTrigger tab="notes" href={jobDetailsPath(jobId, "notes")}>
      Notes
    </DetailsTabTrigger>
  );
}
