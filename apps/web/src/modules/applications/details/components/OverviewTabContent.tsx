"use client";

import { FieldWithLabelAction, OverviewSection, Text } from "@job-tracker/ui";

import {
  ApplicationDocument,
  ApplicationsDocument,
  ApplicationSource,
  useRemoveApplicationTagMutation,
  useUpdateApplicationMutation,
} from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import { ApplicationTags } from "@/modules/applications/shared/components/ApplicationTags";
import { CompanyNameWithPopover } from "@/modules/applications/shared/components/CompanyNameWithPopover";
import { JobUrls } from "@/modules/applications/shared/components/JobUrls";
import { formatSalary } from "@/modules/applications/shared/utils/salaryFormat";
import { CompanyEditDialog } from "@/modules/companies/shared/components/CompanyEditDialog";

import { SalaryEditDialog } from "./SalaryEditDialog";
import { SourceEditDialog } from "./SourceEditDialog";
import { TagsEditDialog } from "./TagsEditDialog";
import { TextFieldEditDialog } from "./TextFieldEditDialog";
import { UrlFieldEditDialog } from "./UrlFieldEditDialog";

export function OverviewTabContent({
  application,
  sourcePrimaryText,
  onSuccess,
  onError,
}: {
  application: ApplicationDetailsValues;
  /** From `useApplicationDetailsViewModel`: primary line for Source, or null → “Not set”. */
  sourcePrimaryText: string | null;
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

  async function handleSaveUrl(nextValue: string[]) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { urls: nextValue } },
      });
      onSuccess?.("Job URLs updated.");
    } catch {
      onError?.("Could not update job URL.");
    }
  }

  async function handleSaveSource(nextValue: ApplicationSource | null) {
    try {
      await updateApplication({
        variables: { id: application.id, input: { source: nextValue } },
      });
      onSuccess?.("Source updated.");
    } catch {
      onError?.("Could not update source.");
    }
  }

  const salary = formatSalary(application.salary);
  const tags = application.tags ?? [];

  return (
    <OverviewSection>
      <div className="max-w-full">
        <FieldWithLabelAction
          label="Job title"
          content={<Text size="sm">{application.title}</Text>}
          actions={
            <TextFieldEditDialog
              label="Job title"
              value={application.title}
              placeholder="e.g. Senior Frontend Engineer"
              onSave={handleSaveTitle}
            />
          }
        />
      </div>

      <div className="max-w-full">
        <FieldWithLabelAction
          label="Company"
          content={
            <CompanyNameWithPopover
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
          actions={
            <CompanyEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className="max-w-full">
        <FieldWithLabelAction
          label="Job URLs"
          content={
            <JobUrls
              urls={application.urls}
              linkClassName="block leading-normal"
              emptyLabel="Not set"
            />
          }
          actions={
            <UrlFieldEditDialog
              value={application.urls}
              onSave={handleSaveUrl}
            />
          }
        />
      </div>

      <div className="max-w-full">
        <FieldWithLabelAction
          label="Source"
          content={
            sourcePrimaryText ? (
              <Text size="sm">{sourcePrimaryText}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          actions={
            <SourceEditDialog
              value={application.source}
              onSave={handleSaveSource}
            />
          }
        />
      </div>

      <div className="max-w-full">
        <FieldWithLabelAction
          label="Salary"
          content={
            salary ? (
              <Text size="sm">{salary}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          actions={
            <SalaryEditDialog
              application={application}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>

      <div className="max-w-full">
        <FieldWithLabelAction
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
          actions={
            <TagsEditDialog
              applicationId={application.id}
              tags={tags}
              onSuccess={onSuccess}
              onError={onError}
            />
          }
        />
      </div>
    </OverviewSection>
  );
}
