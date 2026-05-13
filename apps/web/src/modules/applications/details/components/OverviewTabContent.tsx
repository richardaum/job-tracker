"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  cn,
  FieldWithLabelAction,
  OverviewSection,
  Text,
  useDialog,
} from "@job-tracker/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react";

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

import { FitAnalysisField } from "./FitAnalysisField";
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
  const titleDialog = useDialog();
  const urlDialog = useDialog();
  const sourceDialog = useDialog();
  const tagsDialog = useDialog();
  const companyDialog = useDialog();
  const salaryDialog = useDialog();

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
    const [error] = await tryRun(
      removeApplicationTag({ variables: { id: application.id, tag } }),
    );
    if (error) {
      onError?.("Could not remove tag.");
      return;
    }
    onSuccess?.("Tag removed.");
  }

  async function handleSaveTitle(nextValue: string) {
    const [error] = await tryRun(
      updateApplication({
        variables: { id: application.id, input: { title: nextValue } },
      }),
    );
    if (error) {
      onError?.("Could not update title.");
      return;
    }
    onSuccess?.("Title updated.");
  }

  async function handleSaveUrl(nextValue: string[]) {
    const [error] = await tryRun(
      updateApplication({
        variables: { id: application.id, input: { urls: nextValue } },
      }),
    );
    if (error) {
      onError?.("Could not update job URL.");
      return;
    }
    onSuccess?.("Job URLs updated.");
  }

  async function handleSaveSource(nextValue: ApplicationSource | null) {
    const [error] = await tryRun(
      updateApplication({
        variables: { id: application.id, input: { source: nextValue } },
      }),
    );
    if (error) {
      onError?.("Could not update source.");
      return;
    }
    onSuccess?.("Source updated.");
  }

  const salary = formatSalary(application.salary);
  const tags = application.tags ?? [];

  return (
    <OverviewSection>
      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Job title"
          content={<Text size="sm">{application.title}</Text>}
          actions={
            <FieldWithLabelAction.IconActionButton
              label="Edit job title"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={titleDialog.open}
            />
          }
        />
        <TextFieldEditDialog
          control={titleDialog}
          label="Job title"
          value={application.title}
          placeholder="e.g. Senior Frontend Engineer"
          onSave={handleSaveTitle}
        />
      </div>

      <div className={cn("max-w-full")}>
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
            <FieldWithLabelAction.IconActionButton
              label="Edit company"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={companyDialog.open}
            />
          }
        />
        <CompanyEditDialog
          control={companyDialog}
          application={application}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      <div className={cn("max-w-full")}>
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
            <FieldWithLabelAction.IconActionButton
              label="Edit job URL"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={urlDialog.open}
            />
          }
        />
        <UrlFieldEditDialog
          control={urlDialog}
          value={application.urls}
          onSave={handleSaveUrl}
        />
      </div>

      <div className={cn("max-w-full")}>
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
            <FieldWithLabelAction.IconActionButton
              label="Edit source"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={sourceDialog.open}
            />
          }
        />
        <SourceEditDialog
          control={sourceDialog}
          value={application.source}
          onSave={handleSaveSource}
        />
      </div>

      <div className={cn("max-w-full")}>
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
            <FieldWithLabelAction.IconActionButton
              label="Edit salary"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={salaryDialog.open}
            />
          }
        />
        <SalaryEditDialog
          control={salaryDialog}
          application={application}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      <div className={cn("max-w-full")}>
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
            <FieldWithLabelAction.IconActionButton
              label="Edit tags"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={tagsDialog.open}
            />
          }
        />
        <TagsEditDialog
          control={tagsDialog}
          applicationId={application.id}
          tags={tags}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      <FitAnalysisField applicationId={application.id} fit={application.fit} />
    </OverviewSection>
  );
}
