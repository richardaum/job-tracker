"use client";

import { cn, Heading, Text } from "@job-tracker/ui";

import { BackToLink } from "@/components/back-to-link";
import { EntityNotFound } from "@/components/entity-not-found";
import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

export function JobNotesFocusPage({ jobId }: { jobId: string }) {
  // TODO: consume job data from JobDetailsContext instead of calling
  // useJobDetailsViewModel() here (see TODO in that hook).
  const { status, displayTitle } = useJobDetailsViewModel(jobId, {
    includeStageEvents: false,
  });

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex shrink-0 flex-col gap-2 border-b border-border-subtle p-4 sm:px-6 sm:py-5",
        )}
      >
        <BackToLink href={jobDetailsPath(jobId)}>Back to job</BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          <span>{displayTitle !== null ? `${displayTitle} — Notes` : "Job notes"}</span>
        </Heading>
      </div>

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
