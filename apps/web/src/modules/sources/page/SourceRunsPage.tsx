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
  Tooltip,
} from "@job-tracker/ui";
import {
  BriefcaseIcon,
  CaretDownIcon,
  ClockIcon,
  LinkIcon,
  ListIcon,
  StopCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { Route } from "next";
import NextLink from "next/link";
import { use, useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header/DetailPageHeader";
import { EmptyState } from "@/components/empty-state";
import { EntityNotFound } from "@/components/entity-not-found";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { useSourceRunsViewModel } from "@/modules/sources/hooks/useSourceRunsViewModel";
import { formatSourceRunStatusLabel, sourceRunStatusBadgeIntent } from "@/modules/sources/lib/source-runs.display";
import { sourceRunJobsHref } from "@/modules/sources/lib/source-runs.routes";
import { ClearSourceRunsDialog } from "@/modules/sources/page/ClearSourceRunsDialog";
import { DeleteSourceRunDialog } from "@/modules/sources/page/DeleteSourceRunDialog";
import { DeleteSourceTemplateDialog } from "@/modules/sources/page/DeleteSourceTemplateDialog";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";
import { SourceRunActivityEventsDialog } from "@/modules/sources/page/SourceRunActivityEventsDialog";
import { SourceScheduleDialog } from "@/modules/sources/page/SourceScheduleDialog";
import { SourceStopConfigDialog } from "@/modules/sources/page/SourceStopConfigDialog";
import { SourceSurfaceUrlDialog } from "@/modules/sources/page/SourceSurfaceUrlDialog";

interface PageProps {
  params: Promise<{ planId: string; templateId: string }>;
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

function runLabel(index: number, total: number): string {
  return `Run ${total - index}`;
}

export default function SourceRunsPage({ params }: PageProps) {
  const { planId, templateId } = use(params);
  const { template, error, status, notFound, showInitialLoading } = useSourceRunsViewModel(templateId);

  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [surfaceUrlDialogOpen, setSurfaceUrlDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [stopConfigDialogOpen, setStopConfigDialogOpen] = useState(false);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [clearRunsDialogOpen, setClearRunsDialogOpen] = useState(false);

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
                  className={cn("transition-transform duration-200", actionsMenuOpen ? "rotate-180" : "rotate-0")}
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
          <DropdownMenuItem
            onSelect={() => setStopConfigDialogOpen(true)}
            icon={<StopCircleIcon size={14} weight="regular" />}
          >
            Edit stop condition
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={() => setClearRunsDialogOpen(true)}
            icon={<TrashIcon size={14} weight="regular" />}
          >
            Remove all runs
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            onSelect={() => setDeleteTemplateDialogOpen(true)}
            icon={<TrashIcon size={14} weight="regular" />}
          >
            Remove template
          </DropdownMenuItem>
        </DropdownMenu>
        <RunSourceTemplateButton templateId={template.id} label="Run again" tooltip="Run again" variant="button" />
      </div>
    ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader trailing={headerActions}>
        <BackToLink href={`/sources/plans/${planId}` as Route}>Back to plan</BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          Source runs
        </Heading>
        {template ? (
          <Text size="sm" color="secondary">
            {scheduleSummary(template)} · Created {formatDateTime(String(template.createdAt))}
          </Text>
        ) : null}
      </DetailPageHeader>

      <div className={cn("flex-1 min-h-0 overflow-auto p-4 sm:p-6")}>
        {showInitialLoading ? (
          <SourceRunsListSkeleton />
        ) : notFound ? (
          <EntityNotFound resource="source" backHref="/sources" backLabel="Back to sources" />
        ) : error && !notFound ? (
          <Text size="sm" color="error">
            Failed to load source runs.
          </Text>
        ) : status !== "success" || !template ? null : template.runs.length === 0 ? (
          <EmptyState variant="default" message="No runs for this source yet." />
        ) : (
          <Stack gap="sm" className={cn("min-w-0")}>
            {template.runs.map((run, index) => (
              <ListItemCard
                key={run.id}
                className={cn("min-w-0")}
                title={<ListItemCard.Title size="sm">{runLabel(index, template.runs.length)}</ListItemCard.Title>}
                actions={
                  <ListItemCard.Actions>
                    <Tooltip
                      content={
                        <div className={cn("flex flex-col gap-0.5")}>
                          <span className={cn("font-medium")}>Run failed</span>
                          <span>{run.errorMessage}</span>
                        </div>
                      }
                      enabled={run.status === "Failed" && !!run.errorMessage}
                    >
                      <Badge intent={sourceRunStatusBadgeIntent(run.status)}>
                        {formatSourceRunStatusLabel(run.status)}
                      </Badge>
                    </Tooltip>
                    <IconButton
                      asChild
                      intent="ghost"
                      size="sm"
                      label={`View jobs from ${runLabel(index, template.runs.length)}`}
                      tooltip="View jobs"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                    >
                      <NextLink href={sourceRunJobsHref(run.id)}>
                        <BriefcaseIcon size={13} weight="regular" aria-hidden />
                      </NextLink>
                    </IconButton>
                    <SourceRunActivityEventsDialog
                      runId={run.id}
                      runLabel={runLabel(index, template.runs.length)}
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Events for ${runLabel(index, template.runs.length)}`}
                          tooltip="View events"
                          className={cn(ListItemCard.actionIconButtonClassName)}
                          icon={<ListIcon size={13} weight="regular" />}
                        />
                      }
                    />
                    <DeleteSourceRunDialog
                      trigger={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label={`Delete ${runLabel(index, template.runs.length)}`}
                          tooltip="Delete run"
                          className={cn(ListItemCard.actionIconButtonClassName)}
                          icon={<TrashIcon size={13} weight="regular" />}
                        />
                      }
                      runId={run.id}
                      templateId={template.id}
                      runLabel={runLabel(index, template.runs.length)}
                    />
                  </ListItemCard.Actions>
                }
                description={
                  <Text size="sm" color="secondary">
                    Started {formatDateTime(String(run.startedAt))}
                    {run.jobCount !== undefined && ` · ${run.jobCount} jobs`}
                  </Text>
                }
              />
            ))}
          </Stack>
        )}
      </div>

      <SourceSurfaceUrlDialog
        template={surfaceUrlDialogOpen ? template : null}
        onOpenChange={setSurfaceUrlDialogOpen}
      />

      <SourceScheduleDialog template={scheduleDialogOpen ? template : null} onOpenChange={setScheduleDialogOpen} />

      <SourceStopConfigDialog
        template={stopConfigDialogOpen ? template : null}
        onOpenChange={setStopConfigDialogOpen}
      />

      <ClearSourceRunsDialog open={clearRunsDialogOpen} onOpenChange={setClearRunsDialogOpen} templateId={templateId} />

      <DeleteSourceTemplateDialog
        open={deleteTemplateDialogOpen}
        onOpenChange={setDeleteTemplateDialogOpen}
        templateId={templateId}
        planId={planId}
      />
    </div>
  );
}
