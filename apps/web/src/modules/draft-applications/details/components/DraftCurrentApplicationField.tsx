"use client";

import { cn, FieldWithLabelAction } from "@job-tracker/ui";
import Link from "next/link";

import type { ApplicationQuery } from "@/gql/hooks";

type ApplicationPreview = Partial<
  Pick<ApplicationQuery["application"], "id" | "title"> & {
    company: Pick<ApplicationQuery["application"]["company"], "name">;
  }
>;

interface DraftCurrentApplicationFieldProps {
  application?: ApplicationPreview | null;
}

export function DraftCurrentApplicationField({
  application,
}: DraftCurrentApplicationFieldProps) {
  const applicationId = application?.id;
  const linkedApplicationTitle = application?.title;
  const linkedApplicationCompanyName = application?.company?.name;

  if (
    !applicationId ||
    !linkedApplicationTitle ||
    !linkedApplicationCompanyName
  ) {
    return null;
  }

  const linkedApplicationLabel = `${linkedApplicationTitle} @ ${linkedApplicationCompanyName}`;

  return (
    <FieldWithLabelAction
      label="Current application"
      content={
        <Link
          href={`/applications/${applicationId}`}
          className={cn(
            "block max-w-full truncate text-sm text-text-brand underline-offset-2 hover:underline",
          )}
          title={linkedApplicationLabel}
        >
          {linkedApplicationLabel}
        </Link>
      }
    />
  );
}
