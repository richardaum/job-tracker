"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  cn,
  DropdownMenu,
  DropdownMenuItem,
  FieldWithLabelAction,
  OverviewSection,
  Text,
  useDialog,
} from "@job-tracker/ui";
import { ArrowSquareOutIcon, DotsThreeOutlineVerticalIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import {
  JobDocument,
  JobsDocument,
  JobSource,
  useRemoveJobTagMutation,
  useRequestJobSummaryMutation,
  useUpdateJobMutation,
} from "@/gql/hooks";
import { useGenerateJobLocationWithAiLazyQuery, useGenerateJobWorkRegionWithAiLazyQuery } from "@/gql/hooks";
import { CompanySwitchDialog } from "@/modules/jobs/shared/components/CompanySwitchDialog";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { CompanyNameWithPopover } from "@/modules/jobs/shared/components/CompanyNameWithPopover";
import { JobTags } from "@/modules/jobs/shared/components/JobTags";
import { JobUrls } from "@/modules/jobs/shared/components/JobUrls";
import { formatSalary } from "@/modules/jobs/shared/utils/salaryFormat";

import { MatchAnalysisField } from "./MatchAnalysisField";
import { SalaryEditDialog } from "./SalaryEditDialog";
import { SourceEditDialog } from "./SourceEditDialog";
import { SummaryField } from "./SummaryField";
import { TagsEditDialog } from "./TagsEditDialog";
import { TextFieldEditDialog } from "./TextFieldEditDialog";
import { UrlFieldEditDialog } from "./UrlFieldEditDialog";

type OverviewTabContentProps = {
  job: JobDetailsValues;
  sourcePrimaryText: string | null | undefined;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
};

export function OverviewTabContent({ job, sourcePrimaryText, onSuccess, onError }: OverviewTabContentProps) {
  const router = useRouter();
  const titleDialog = useDialog();
  const urlDialog = useDialog();
  const sourceDialog = useDialog();
  const tagsDialog = useDialog();
  const switchCompanyDialog = useDialog();
  const salaryDialog = useDialog();
  const locationDialog = useDialog();
  const workRegionDialog = useDialog();
  const [updateJob] = useUpdateJobMutation({
    refetchQueries: [{ query: JobDocument, variables: { id: job.id } }, { query: JobsDocument }],
  });

  const [removeJobTag] = useRemoveJobTagMutation({
    refetchQueries: [{ query: JobDocument, variables: { id: job.id } }, { query: JobsDocument }],
  });

  const [inferLocation] = useGenerateJobLocationWithAiLazyQuery();
  const [inferWorkRegion] = useGenerateJobWorkRegionWithAiLazyQuery();
  const [requestSummary] = useRequestJobSummaryMutation();

  async function handleRemoveTag(tag: string) {
    const [error] = await tryRun(removeJobTag({ variables: { id: job.id, tag } }));
    if (error) {
      onError?.("Could not remove tag.");
      return;
    }
    onSuccess?.("Tag removed.");
  }

  async function handleSaveTitle(nextValue: string) {
    const [error] = await tryRun(updateJob({ variables: { id: job.id, input: { title: nextValue } } }));
    if (error) {
      onError?.("Could not update title.");
      return;
    }
    onSuccess?.("Title updated.");
  }

  async function handleSaveUrl(nextValue: string[]) {
    const [error] = await tryRun(updateJob({ variables: { id: job.id, input: { urls: nextValue } } }));
    if (error) {
      onError?.("Could not update job URL.");
      return;
    }
    onSuccess?.("Job URLs updated.");
  }

  async function handleSaveSource(nextValue: JobSource | null) {
    const [error] = await tryRun(updateJob({ variables: { id: job.id, input: { source: nextValue } } }));
    if (error) {
      onError?.("Could not update source.");
      return;
    }
    onSuccess?.("Source updated.");
  }

  async function handleSaveLocation(nextValue: string) {
    const [error] = await tryRun(updateJob({ variables: { id: job.id, input: { location: nextValue || null } } }));
    if (error) {
      onError?.("Could not update location.");
      return;
    }
    onSuccess?.("Location updated.");
  }

  async function handleSaveWorkRegion(nextValue: string) {
    const [error] = await tryRun(updateJob({ variables: { id: job.id, input: { workRegion: nextValue || null } } }));
    if (error) {
      onError?.("Could not update work region.");
      return;
    }
    onSuccess?.("Work region updated.");
  }

  async function handleInferLocation(): Promise<string | null> {
    const { data, error: queryError } = await inferLocation({ variables: { jobId: job.id } });
    if (queryError) {
      onError?.("Could not infer location.");
      return null;
    }
    const value = data?.generateJobLocationWithAI;
    if (!value) {
      onError?.("Could not infer location from description.");
      return null;
    }
    return value;
  }

  async function handleInferWorkRegion(): Promise<string | null> {
    const { data, error: queryError } = await inferWorkRegion({ variables: { jobId: job.id } });
    if (queryError) {
      onError?.("Could not infer work region.");
      return null;
    }
    const value = data?.generateJobWorkRegionWithAI;
    if (!value) {
      onError?.("Could not infer work region from description.");
      return null;
    }
    return value;
  }

  async function handleGenerateSummary() {
    const [error] = await tryRun(
      requestSummary({
        variables: { jobId: job.id },
        refetchQueries: [{ query: JobDocument, variables: { id: job.id } }],
      }),
    );
    if (error) {
      onError?.("Could not generate summary.");
      return;
    }
    onSuccess?.("Summary generation started.");
  }

  const salary = formatSalary(job.salary);
  const tags = job.tags ?? [];
  const showCompanyMeta = Boolean(job.company?.name?.trim());

  return (
    <OverviewSection>
      <SummaryField
        summary={job.summary}
        summaryMetadata={job.summaryMetadata}
        onGenerateSummary={handleGenerateSummary}
      />

      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Job title"
          content={<Text size="sm">{jobDetailDisplayTitle(job.title)}</Text>}
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
          value={job.title ?? ""}
          placeholder="e.g. Senior Frontend Engineer"
          onSave={handleSaveTitle}
        />
      </div>

      <div className={cn("max-w-full")} data-welcome-tour-step="job-company">
        <FieldWithLabelAction
          label="Company"
          content={
            showCompanyMeta ? (
              <CompanyNameWithPopover job={job} onSuccess={onSuccess} onError={onError} />
            ) : (
              <Text size="sm" color="muted">
                Not set
              </Text>
            )
          }
          actions={
            showCompanyMeta ? (
              <DropdownMenu
                trigger={
                  <FieldWithLabelAction.IconActionButton
                    label="Company actions"
                    icon={<DotsThreeOutlineVerticalIcon size={14} weight="regular" />}
                  />
                }
              >
                <DropdownMenuItem
                  icon={<ArrowSquareOutIcon size={14} weight="regular" />}
                  onSelect={() => router.push(`/companies/${encodeURIComponent(job.company!.id)}`)}
                >
                  View company
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={<PencilSimpleIcon size={14} weight="regular" />}
                  onSelect={switchCompanyDialog.open}
                >
                  Switch company
                </DropdownMenuItem>
              </DropdownMenu>
            ) : null
          }
        />
        <CompanySwitchDialog
          control={switchCompanyDialog}
          jobId={job.id}
          currentCompanyId={job.company?.id}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>

      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Job URLs"
          content={<JobUrls urls={job.urls} linkClassName="block leading-normal" emptyLabel="Not set" />}
          actions={
            <FieldWithLabelAction.IconActionButton
              label="Edit job URL"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={urlDialog.open}
            />
          }
        />
        <UrlFieldEditDialog control={urlDialog} value={job.urls} onSave={handleSaveUrl} />
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
        <SourceEditDialog control={sourceDialog} value={job.source} onSave={handleSaveSource} />
      </div>

      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Location"
          content={
            job.location ? (
              <Text size="sm">{job.location}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          actions={
            <FieldWithLabelAction.IconActionButton
              label="Edit location"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={locationDialog.open}
            />
          }
        />
        <TextFieldEditDialog
          control={locationDialog}
          label="Location"
          value={job.location ?? ""}
          placeholder="e.g. São Paulo, SP"
          onSave={handleSaveLocation}
          onAiFill={handleInferLocation}
        />
      </div>

      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Work region"
          content={
            job.workRegion ? (
              <Text size="sm">{job.workRegion}</Text>
            ) : (
              <Text size="sm" color="secondary">
                Not set
              </Text>
            )
          }
          actions={
            <FieldWithLabelAction.IconActionButton
              label="Edit work region"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={workRegionDialog.open}
            />
          }
        />
        <TextFieldEditDialog
          control={workRegionDialog}
          label="Work region"
          value={job.workRegion ?? ""}
          placeholder="e.g. Brazil, Latam, Anywhere"
          onSave={handleSaveWorkRegion}
          onAiFill={handleInferWorkRegion}
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
        <SalaryEditDialog control={salaryDialog} job={job} onSuccess={onSuccess} onError={onError} />
      </div>

      <MatchAnalysisField jobId={job.id} match={job.match} />

      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Tags"
          content={
            tags.length > 0 ? (
              <JobTags tags={tags} onRemoveTag={handleRemoveTag} />
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
        <TagsEditDialog control={tagsDialog} jobId={job.id} tags={tags} onSuccess={onSuccess} onError={onError} />
      </div>
    </OverviewSection>
  );
}
