"use client";

import type { Route } from "next";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type NotesTabProps = { jobId: string; fullWidth?: boolean };

export function NotesTab({ jobId, fullWidth }: NotesTabProps) {
  const href = fullWidth ? (`/jobs/${jobId}/notes?w=full` as Route) : (`/jobs/${jobId}/notes` as Route);
  return (
    <DetailsTabTrigger tab="notes" href={href}>
      Notes
    </DetailsTabTrigger>
  );
}
