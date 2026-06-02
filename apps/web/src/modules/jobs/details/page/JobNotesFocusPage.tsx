"use client";

import { cn, Text } from "@job-tracker/ui";
import type { Route } from "next";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { EntityNotFound } from "@/components/entity-not-found";
import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";

type JobNotesFocusPageProps = { jobId: string };
export function JobNotesFocusPage({ jobId }: JobNotesFocusPageProps) {
  // TODO: consume job data from JobDetailsContext instead of calling
  // useJobDetailsViewModel() here (see TODO in that hook).
  const { status, displayTitle } = useJobDetailsViewModel(jobId, { includeStageEvents: false });

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader>
        <BackToLink href={`/jobs/${jobId}` as Route}>Back to job</BackToLink>
        <DetailPageHeader.Title>
          {displayTitle !== null ? `${displayTitle} — Notes` : "Job notes"}
        </DetailPageHeader.Title>
      </DetailPageHeader>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading notes...
          </Text>
        ) : status === "notFound" ? (
          <EntityNotFound resource="job" backHref="/jobs" backLabel="Back to jobs" />
        ) : status === "error" ? (
          <Text size="sm" color="error">
            Failed to load notes.
          </Text>
        ) : status === "success" ? (
          <div className={cn("mx-auto flex h-full max-w-5xl flex-col")}>
            <NotesPanel jobId={jobId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
