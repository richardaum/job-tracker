"use client";

import React from "react";
import Link from "next/link";
import { Heading, Text, cn } from "@job-tracker/ui";
import { useApplicationQuery } from "@/gql/hooks";
import { type ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { NotesPanel } from "@/modules/applications/details/components/NotesPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationNotesPage({ params }: PageProps) {
  const { id } = React.use(params);

  const { data, loading, error } = useApplicationQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  const application = data?.application as ApplicationDetailsValues | undefined;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5 shrink-0",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href={`/applications/${id}`}
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to application
          </Link>
        </div>
        <div className={cn("flex items-start gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0 flex-1")}>
            <span>
              {application?.title
                ? `${application.title} — Notes`
                : "Application notes"}
            </span>
          </Heading>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {loading && !data ? (
          <Text size="sm" color="secondary">
            Loading notes...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load notes.
          </Text>
        ) : !application ? (
          <Text size="sm" color="secondary">
            Application not found.
          </Text>
        ) : (
          <div className={cn("h-full max-w-5xl mx-auto flex flex-col")}>
            <NotesPanel applicationId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
