"use client";

import { cn, Heading, Text } from "@job-tracker/ui";
import React from "react";

import { BackToLink } from "@/components/back-to-link";
import { EntityNotFound } from "@/components/entity-not-found";
import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";
import { useJobNotesViewModel } from "@/modules/jobs/details/hooks/useJobNotesViewModel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobNotesPage({ params }: PageProps) {
  const { id } = React.use(params);

  const { job, status, shouldGoBackToJob, shouldGoBackToTheJobsList } =
    useJobNotesViewModel(id);

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4  sm:px-6 sm:py-5 shrink-0",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          {shouldGoBackToJob ? (
            <BackToLink href={`/jobs/${id}`}>Back to job</BackToLink>
          ) : shouldGoBackToTheJobsList ? (
            <BackToLink href="/jobs">Back to jobs</BackToLink>
          ) : null}
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            <span>{job?.title ? `${job.title} — Notes` : "Job notes"}</span>
          </Heading>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading notes...
          </Text>
        ) : status === "notFound" ? (
          <EntityNotFound
            resource="job"
            backHref="/jobs"
            backLabel="Back to jobs"
          />
        ) : status === "error" ? (
          <Text size="sm" color="error">
            Failed to load notes.
          </Text>
        ) : (
          <div className={cn("h-full max-w-5xl mx-auto flex flex-col")}>
            <NotesPanel jobId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
