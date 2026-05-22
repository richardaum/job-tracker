"use client";

import { cn, FieldWithLabelAction } from "@job-tracker/ui";
import Link from "next/link";

import type { JobQuery } from "@/gql/hooks";

type JobPreview = Partial<
  Pick<JobQuery["job"], "id" | "title"> & {
    company: Pick<JobQuery["job"]["company"], "name">;
  }
>;

interface DraftCurrentJobFieldProps {
  job?: JobPreview | null;
}

export function DraftCurrentJobField({ job }: DraftCurrentJobFieldProps) {
  const jobId = job?.id;
  const linkedJobTitle = job?.title;
  const linkedJobCompanyName = job?.company?.name;

  if (!jobId || !linkedJobTitle || !linkedJobCompanyName) {
    return null;
  }

  const linkedJobLabel = `${linkedJobTitle} @ ${linkedJobCompanyName}`;

  return (
    <FieldWithLabelAction
      label="Current job"
      content={
        <Link
          href={`/jobs/${jobId}`}
          className={cn(
            "block max-w-full truncate text-sm text-text-brand underline-offset-2 hover:underline",
          )}
          title={linkedJobLabel}
        >
          {linkedJobLabel}
        </Link>
      }
    />
  );
}
