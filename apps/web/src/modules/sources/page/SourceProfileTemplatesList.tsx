"use client";

import {
  Card,
  cn,
  IconButton,
  ListItemCard,
  Skeleton,
  Stack,
  Text,
} from "@job-tracker/ui";
import { ClockIcon, LinkIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useCallback, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useSourcesForSourceProfileQuery } from "@/gql/hooks";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { DeleteSourceDialog } from "@/modules/sources/page/DeleteSourceDialog";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";
import { SourceScheduleDialog } from "@/modules/sources/page/SourceScheduleDialog";
import { SourceSurfaceUrlDialog } from "@/modules/sources/page/SourceSurfaceUrlDialog";

export function SourceCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="sm" className={cn("min-w-0")}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} padding="sm">
          <Stack gap="xs" className={cn("min-w-0")}>
            <Skeleton variant="text" className={cn("h-4 w-full max-w-56")} />
            <Skeleton variant="text" className={cn("h-4 w-32")} />
            <Skeleton variant="text" className={cn("h-4 w-48 max-w-full")} />
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

export function SourceProfileTemplatesList({
  sourceProfileId,
}: {
  sourceProfileId: string;
}) {
  const [surfaceDialogTemplate, setSurfaceDialogTemplate] =
    useState<SourceListItem | null>(null);
  const [scheduleDialogTemplate, setScheduleDialogTemplate] =
    useState<SourceListItem | null>(null);

  const { data, loading, error } = useSourcesForSourceProfileQuery({
    variables: { sourceProfileId },
  });

  const sources = data?.sourceTemplatesForSourceProfile ?? [];

  const showSkeleton = loading && !data;

  const clearDialogsForTemplate = useCallback((templateId: string) => {
    setSurfaceDialogTemplate((t) => (t?.id === templateId ? null : t));
    setScheduleDialogTemplate((t) => (t?.id === templateId ? null : t));
  }, []);

  const patchTemplateIfSame = useCallback(
    (id: string, patch: Partial<SourceListItem>) => {
      setSurfaceDialogTemplate((t) => (t?.id === id ? { ...t, ...patch } : t));
      setScheduleDialogTemplate((t) => (t?.id === id ? { ...t, ...patch } : t));
    },
    [],
  );

  if (showSkeleton) {
    return <SourceCardsSkeleton />;
  }

  if (error) {
    return (
      <Text size="sm" color="error">
        Failed to load sources. Try closing and opening again.
      </Text>
    );
  }

  if (sources.length === 0) {
    return (
      <EmptyState
        variant="panel"
        message="No sources for this source profile."
      />
    );
  }

  return (
    <>
      <Stack gap="sm" className={cn("min-w-0")}>
        {sources.map((template, templateIndex) => (
          <ListItemCard
            key={template.id}
            className={cn("min-w-0")}
            title={
              <ListItemCard.Title
                asChild
                size="sm"
                className={cn(
                  "inline-block max-w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none",
                )}
              >
                <NextLink
                  href={`/sources/profile/${sourceProfileId}/template/${template.id}/runs`}
                  title="View runs for this source"
                >
                  Source {templateIndex + 1}
                </NextLink>
              </ListItemCard.Title>
            }
            actions={
              <ListItemCard.Actions>
                <RunSourceTemplateButton
                  templateId={template.id}
                  sourceProfileId={sourceProfileId}
                  label={`Run source ${templateIndex + 1}`}
                  tooltip="Run source"
                />
                <IconButton
                  intent="ghost"
                  size="sm"
                  label={`Edit listing URL for source ${templateIndex + 1}`}
                  tooltip="Edit surface URL"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<LinkIcon size={13} weight="regular" />}
                  onClick={() => setSurfaceDialogTemplate(template)}
                />
                <IconButton
                  intent="ghost"
                  size="sm"
                  label={`Edit schedule for source ${templateIndex + 1}`}
                  tooltip="Edit schedule"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<ClockIcon size={13} weight="regular" />}
                  onClick={() => setScheduleDialogTemplate(template)}
                />
                <DeleteSourceDialog
                  trigger={
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label={`Delete source ${templateIndex + 1}`}
                      tooltip="Delete source"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                      icon={<TrashIcon size={13} weight="regular" />}
                    />
                  }
                  templateId={template.id}
                  sourceProfileId={sourceProfileId}
                  onDeleted={clearDialogsForTemplate}
                />
              </ListItemCard.Actions>
            }
            meta={
              <Text size="sm" color="secondary">
                {scheduleSummary(template)}
              </Text>
            }
            description={
              <Text size="sm" color="secondary">
                Created {formatDateTime(String(template.createdAt))} ·{" "}
                {template.runs.length}{" "}
                {template.runs.length === 1 ? "run" : "runs"}
              </Text>
            }
          />
        ))}
      </Stack>
      <SourceSurfaceUrlDialog
        sourceProfileId={sourceProfileId}
        template={surfaceDialogTemplate}
        onOpenChange={(open) => {
          if (!open) setSurfaceDialogTemplate(null);
        }}
        onSurfaceSaved={(id, surfaceUrl) =>
          patchTemplateIfSame(id, { surfaceUrl })
        }
      />
      <SourceScheduleDialog
        sourceProfileId={sourceProfileId}
        template={scheduleDialogTemplate}
        onOpenChange={(open) => {
          if (!open) setScheduleDialogTemplate(null);
        }}
        onScheduleSaved={(id, patch) => patchTemplateIfSame(id, patch)}
      />
    </>
  );
}
