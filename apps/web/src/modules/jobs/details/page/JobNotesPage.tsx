"use client";

import { cn, Heading, Text } from "@job-tracker/ui";
import Link from "next/link";
import React from "react";

import { NotesPanel } from "@/modules/jobs/details/components/NotesPanel";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobNotesPage({ params }: PageProps) {
  const { id } = React.use(params);

  const { job, error, showInitialLoading } = useJobDetailsViewModel(id, {
    includeStageEvents: false,
  });

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4  sm:px-6 sm:py-5 shrink-0",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href={`/jobs/${id}`}
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to job
          </Link>
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            <span>{job?.title ? `${job.title} — Notes` : "Job notes"}</span>
          </Heading>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading notes...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load notes.
          </Text>
        ) : !job ? (
          <Text size="sm" color="secondary">
            Job not found.
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
