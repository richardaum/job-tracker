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
import {
  ClockIcon,
  LinkIcon,
  StopCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { Route } from "next";
import NextLink from "next/link";
import { useCallback, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useSourceTemplatesAllQuery } from "@/gql/hooks";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { DeleteSourceDialog } from "@/modules/sources/page/DeleteSourceDialog";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";
import { SourceScheduleDialog } from "@/modules/sources/page/SourceScheduleDialog";
import { SourceStopConfigDialog } from "@/modules/sources/page/SourceStopConfigDialog";
import { SourceSurfaceUrlDialog } from "@/modules/sources/page/SourceSurfaceUrlDialog";

export function TemplateCardsSkeleton({ count = 3 }: { count?: number }) {
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

export function PlanTemplatesList({ planId }: { planId: string }) {
  const [surfaceDialogTemplate, setSurfaceDialogTemplate] =
    useState<SourceListItem | null>(null);
  const [scheduleDialogTemplate, setScheduleDialogTemplate] =
    useState<SourceListItem | null>(null);
  const [stopConfigDialogTemplate, setStopConfigDialogTemplate] =
    useState<SourceListItem | null>(null);
  const { data, loading, error } = useSourceTemplatesAllQuery();

  const templates = useMemo(
    () => (data?.sourceTemplates ?? []).filter((t) => t.planId === planId),
    [data, planId],
  );

  const showSkeleton = loading && !data;

  const clearDialogsForTemplate = useCallback((templateId: string) => {
    setSurfaceDialogTemplate((t: SourceListItem | null) =>
      t?.id === templateId ? null : t,
    );
    setScheduleDialogTemplate((t: SourceListItem | null) =>
      t?.id === templateId ? null : t,
    );
    setStopConfigDialogTemplate((t: SourceListItem | null) =>
      t?.id === templateId ? null : t,
    );
  }, []);

  const patchTemplateIfSame = useCallback(
    (id: string, patch: Partial<SourceListItem>) => {
      setSurfaceDialogTemplate((t: SourceListItem | null) =>
        t?.id === id ? { ...t, ...patch } : t,
      );
      setScheduleDialogTemplate((t: SourceListItem | null) =>
        t?.id === id ? { ...t, ...patch } : t,
      );
    },
    [],
  );

  if (showSkeleton) {
    return <TemplateCardsSkeleton />;
  }

  if (error) {
    return (
      <Text size="sm" color="error">
        Failed to load templates. Try closing and opening again.
      </Text>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyState variant="default" message="No templates for this plan." />
    );
  }

  return (
    <>
      <Stack gap="sm" className={cn("min-w-0")}>
        {templates.map((template) => (
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
                  href={
                    `/sources/plans/${planId}/template/${template.id}/runs` as Route
                  }
                  title="View runs"
                >
                  <span className={cn("truncate")}>
                    {template.surfaceUrl || "Template"}
                  </span>
                </NextLink>
              </ListItemCard.Title>
            }
            actions={
              <ListItemCard.Actions>
                <RunSourceTemplateButton
                  templateId={template.id}
                  label="Run"
                  tooltip="Run template"
                />
                <IconButton
                  intent="ghost"
                  size="sm"
                  label="Edit listing URL"
                  tooltip="Edit surface URL"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<LinkIcon size={13} weight="regular" />}
                  onClick={() => setSurfaceDialogTemplate(template)}
                />
                <IconButton
                  intent="ghost"
                  size="sm"
                  label="Edit schedule"
                  tooltip="Edit schedule"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<ClockIcon size={13} weight="regular" />}
                  onClick={() => setScheduleDialogTemplate(template)}
                />
                <IconButton
                  intent="ghost"
                  size="sm"
                  label="Edit stop condition"
                  tooltip="Edit stop condition"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<StopCircleIcon size={13} weight="regular" />}
                  onClick={() => setStopConfigDialogTemplate(template)}
                />
                <DeleteSourceDialog
                  trigger={
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label="Delete template"
                      tooltip="Delete template"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                      icon={<TrashIcon size={13} weight="regular" />}
                    />
                  }
                  templateId={template.id}
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
        template={surfaceDialogTemplate}
        onOpenChange={(open) => {
          if (!open) setSurfaceDialogTemplate(null);
        }}
        onSurfaceSaved={(id, surfaceUrl) =>
          patchTemplateIfSame(id, { surfaceUrl })
        }
      />
      <SourceScheduleDialog
        template={scheduleDialogTemplate}
        onOpenChange={(open) => {
          if (!open) setScheduleDialogTemplate(null);
        }}
        onScheduleSaved={(id, patch) => patchTemplateIfSame(id, patch)}
      />
      <SourceStopConfigDialog
        template={stopConfigDialogTemplate}
        onOpenChange={(open) => {
          if (!open) setStopConfigDialogTemplate(null);
        }}
        onStopConfigSaved={(id, config) =>
          patchTemplateIfSame(id, { config } as Partial<SourceListItem>)
        }
      />
    </>
  );
}
