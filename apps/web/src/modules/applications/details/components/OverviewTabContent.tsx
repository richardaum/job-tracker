"use client";

import { cn, Link, Text } from "@job-tracker/ui";
import React from "react";

import {
  ApplicationDocument,
  ApplicationsDocument,
  useRemoveApplicationTagMutation,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { CompanyNameWithPopover } from "@/modules/applications/shared/components/CompanyNameWithPopover";
import { ApplicationTags } from "@/modules/applications/shared/utils/ApplicationTags";
import { formatCompensationLine } from "@/modules/applications/shared/utils/compensationFormat";
import { CompanyEditDialog } from "@/modules/companies/shared/components/CompanyEditDialog";

import { CompensationEditDialog } from "./CompensationEditDialog";
import { HoverEditableFieldRow } from "./HoverEditableFieldRow";
import { TagsEditDialog } from "./TagsEditDialog";
import { TextFieldEditDialog } from "./TextFieldEditDialog";
import { UrlFieldEditDialog } from "./UrlFieldEditDialog";

export function OverviewTabContent({
  application,
  onSuccess,
  onError,
}: {
  application: ApplicationDetailsValues;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [updateApplication] = useUpdateApplicationMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  const [removeApplicationTag] = useRemoveApplicationTagMutation({
    refetchQueries: [
      { query: ApplicationDocument, variables: { id: application.id } },
      { query: ApplicationsDocument },
    ],
  });

  async function handleRemoveTag(tag: string) {
    try {
      await removeApplicationTag({ variables: { id: application.id, tag } });
      onSuccess?.("Tag removed.");
    } catch {
      onError?.("Could not remove tag.");
    }
  }

  async function handleSaveTitle(nextValue: string) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { title: nextValue } },
      });
      onSuccess?.("Title updated.");
    } catch {
      onError?.("Could not update title.");
    }
  }

  async function handleSaveUrl(nextValue: string | null) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { url: nextValue } },
      });
      onSuccess?.("Job URL updated.");
    } catch {
      onError?.("Could not update job URL.");
    }
  }

  const compLine = formatCompensationLine({
    salaryMinCents: application.salaryMinCents,
    salaryMaxCents: application.salaryMaxCents,
    salaryCurrency: application.salaryCurrency,
    salaryPeriod: application.salaryPeriod,
  });
  const tags = application.tags ?? [];

  return (
    <div className={cn("flex flex-wrap items-start gap-x-8 gap-y-4")}>
      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Job title"
          content={<Text size="sm">{application.title}</Text>}
          editControl={
            <TextFieldEditDialog
              label="Job title"
              value={application.title}
              placeholder="e.g. Senior Frontend Engineer"
              onSave={handleSaveTitle}
            />
          }
        />
      </div>

      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Company"
          content={
            <CompanyNameWithPopover
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
          editControl={
            <CompanyEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className={cn("max-w-full")}>
        <HoverEditableFieldRow
          label="Job URL"
          content={
            application.url ? (
              <Link
                href={application.url}
                variant="default"
                className="block leading-normal"
              >
                View posting
              </Link>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          editControl={
            <UrlFieldEditDialog
              value={application.url}
              onSave={handleSaveUrl}
            />
          }
        />
      </div>

      <div className={cn("max-w-full sm:col-span-2")}>
        <HoverEditableFieldRow
          label="Compensation"
          content={
            compLine ? (
              <Text size="sm">{compLine}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          editControl={
            <CompensationEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className={cn("max-w-full sm:col-span-2")}>
        <HoverEditableFieldRow
          label="Tags"
          content={
            tags.length > 0 ? (
              <ApplicationTags tags={tags} onRemoveTag={handleRemoveTag} />
            ) : (
              <Text size="sm" color="secondary">
                No tags
              </Text>
            )
          }
          editControl={
            <TagsEditDialog
              applicationId={application.id}
              tags={tags}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>
    </div>
  );
}
