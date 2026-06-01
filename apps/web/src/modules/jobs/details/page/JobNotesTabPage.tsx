"use client";

import { cn } from "@job-tracker/ui";

import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";

type JobNotesTabPageProps = { jobId: string };
export function JobNotesTabPage({ jobId }: JobNotesTabPageProps) {
  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <NotesPanel jobId={jobId} />
    </div>
  );
}
