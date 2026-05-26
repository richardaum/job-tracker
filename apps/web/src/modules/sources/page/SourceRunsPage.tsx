"use client";

import {
  Badge,
  Card,
  cn,
  Heading,
  IconButton,
  ListItemCard,
  Skeleton,
  Stack,
  Text,
} from "@job-tracker/ui";
import { BriefcaseIcon, TrashIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import NextLink from "next/link";
import React from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { EmptyState } from "@/components/empty-state";
import { EntityNotFound } from "@/components/entity-not-found";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { useSourceRunsViewModel } from "@/modules/sources/hooks/useSourceRunsViewModel";
import {
  formatSourceRunStatusLabel,
  sourceRunStatusBadgeIntent,
} from "@/modules/sources/lib/source-runs.display";
import { sourceRunJobsHref } from "@/modules/sources/lib/source-runs.routes";
import { DeleteSourceRunDialog } from "@/modules/sources/page/DeleteSourceRunDialog";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";

interface PageProps {
  params: Promise<{ profileId: string; templateId: string }>;
}

function SourceRunsListSkeleton() {
  return (
    <Stack gap="sm">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} padding="sm">
          <Stack gap="xs" className={cn("min-w-0")}>
            <Skeleton variant="text" className={cn("h-4 w-24")} />
            <Skeleton variant="text" className={cn("h-4 w-48 max-w-full")} />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function runLabel(index: number): string {
  return `Run ${index + 1}`;
}

export default function SourceRunsPage({ params }: PageProps) {
  const { profileId, templateId } = React.use(params);
  const { template, error, status, notFound, showInitialLoading } =
    useSourceRunsViewModel(templateId);

  const headerActions =
    template !== null ? (
      <RunSourceTemplateButton
        templateId={template.id}
        sourceProfileId={template.sourceProfileId}
        label="Run again"
        tooltip="Run again"
        variant="button"
      />
    ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader trailing={headerActions}>
        <BackToLink href={`/sources/profile/${profileId}` as Route}>
          Back to source profile
        </BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          Source runs
        </Heading>
        {template ? (
          <Text size="sm" color="secondary">
            {scheduleSummary(template)} · Created{" "}
            {formatDateTime(String(template.createdAt))}
          </Text>
        ) : null}
      </DetailPageHeader>

      <div className={cn("flex-1 min-h-0 overflow-auto p-4 sm:p-6")}>
        {showInitialLoading ? (
          <SourceRunsListSkeleton />
        ) : notFound ? (
          <EntityNotFound
            resource="source"
            backHref="/sources"
            backLabel="Back to sources"
          />
        ) : error && !notFound ? (
          <Text size="sm" color="error">
            Failed to load source runs.
          </Text>
        ) : status !== "success" || !template ? null : template.runs.length ===
          0 ? (
          <EmptyState
            variant="default"
            message="No runs for this source yet."
          />
        ) : (
          <Stack gap="sm" className={cn("min-w-0")}>
            {template.runs.map((run, index) => (
              <ListItemCard
                key={run.id}
                className={cn("min-w-0")}
                title={
                  <ListItemCard.Title size="sm">
                    {runLabel(index)}
                  </ListItemCard.Title>
                }
                actions={
                  <ListItemCard.Actions>
                    <Badge intent={sourceRunStatusBadgeIntent(run.status)}>
                      {formatSourceRunStatusLabel(run.status)}
                    </Badge>
                    <IconButton
                      asChild
                      intent="ghost"
                      size="sm"
                      label={`View jobs from ${runLabel(index)}`}
                      tooltip="View jobs"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                    >
                      <NextLink href={sourceRunJobsHref(run.id)}>
                        <BriefcaseIcon size={13} weight="regular" aria-hidden />
                      </NextLink>
                    </IconButton>
                    <DeleteSourceRunDialog
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Delete ${runLabel(index)}`}
                          tooltip="Delete run"
                          className={cn(ListItemCard.actionIconButtonClassName)}
                          icon={<TrashIcon size={13} weight="regular" />}
                        />
                      }
                      runId={run.id}
                      templateId={template.id}
                      sourceProfileId={template.sourceProfileId}
                      runLabel={runLabel(index)}
                    />
                  </ListItemCard.Actions>
                }
                description={
                  <Text size="sm" color="secondary">
                    Started {formatDateTime(String(run.startedAt))}
                  </Text>
                }
              />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
