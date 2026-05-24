"use client";

import { cn } from "@job-tracker/ui";

import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";

export function JobNotesTabPage({ jobId }: { jobId: string }) {
  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <NotesPanel jobId={jobId} />
    </div>
  );
}
