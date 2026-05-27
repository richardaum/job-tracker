"use client";

import {
  Badge,
  Button,
  Card,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Heading,
  IconButton,
  ListItemCard,
  Skeleton,
  Stack,
  Text,
} from "@job-tracker/ui";
import {
  BriefcaseIcon,
  CaretDownIcon,
  ClockIcon,
  LinkIcon,
  TrashIcon,
} from "@phosphor-icons/react";
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
import { DeleteSourceTemplateDialog } from "@/modules/sources/page/DeleteSourceTemplateDialog";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";
import { SourceScheduleDialog } from "@/modules/sources/page/SourceScheduleDialog";
import { SourceSurfaceUrlDialog } from "@/modules/sources/page/SourceSurfaceUrlDialog";

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

  const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
  const [surfaceUrlDialogOpen, setSurfaceUrlDialogOpen] = React.useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] =
    React.useState(false);

  const headerActions =
    template !== null ? (
      <div className={cn("flex items-center gap-2")}>
        <DropdownMenu
          open={actionsMenuOpen}
          onOpenChange={setActionsMenuOpen}
          trigger={
            <Button
              intent="secondary"
              size="md"
              rightIcon={
                <CaretDownIcon
                  size={12}
                  weight="bold"
                  className={cn(
                    "transition-transform duration-200",
                    actionsMenuOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              }
            >
              Actions
            </Button>
          }
          align="end"
        >
          <DropdownMenuItem
            onSelect={() => setSurfaceUrlDialogOpen(true)}
            icon={<LinkIcon size={14} weight="regular" />}
          >
            Edit URL
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setScheduleDialogOpen(true)}
            icon={<ClockIcon size={14} weight="regular" />}
          >
            Edit schedule
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={() => setDeleteTemplateDialogOpen(true)}
            icon={<TrashIcon size={14} weight="regular" />}
          >
            Remove template
          </DropdownMenuItem>
        </DropdownMenu>
        <RunSourceTemplateButton
          templateId={template.id}
          sourceProfileId={template.sourceProfileId}
          label="Run again"
          tooltip="Run again"
          variant="button"
        />
      </div>
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

      <SourceSurfaceUrlDialog
        sourceProfileId={template?.sourceProfileId ?? ""}
        template={surfaceUrlDialogOpen ? template : null}
        onOpenChange={setSurfaceUrlDialogOpen}
      />

      <SourceScheduleDialog
        sourceProfileId={template?.sourceProfileId ?? ""}
        template={scheduleDialogOpen ? template : null}
        onOpenChange={setScheduleDialogOpen}
      />

      <DeleteSourceTemplateDialog
        open={deleteTemplateDialogOpen}
        onOpenChange={setDeleteTemplateDialogOpen}
        templateId={templateId}
        sourceProfileId={profileId}
      />
    </div>
  );
}
