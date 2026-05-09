"use client";

import {
  Card,
  cn,
  IconButton,
  ListItemCard,
  SideDetails,
  Skeleton,
  Stack,
  Text,
} from "@job-tracker/ui";
import { ClockIcon, LinkSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import React, { useCallback, useState } from "react";

import { useImportTemplatesForImporterQuery } from "@/gql/hooks";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";
import type { ImporterRow } from "@/modules/imports/hooks/useImportersListViewModel";
import { DeleteImportTemplateDialog } from "@/modules/imports/page/DeleteImportTemplateDialog";
import type { ImportTemplateListItem } from "@/modules/imports/page/import-template-list.shared";
import { scheduleSummary } from "@/modules/imports/page/import-template-list.shared";
import { ImportTemplateRunsDialog } from "@/modules/imports/page/ImportTemplateRunsDialog";
import { ImportTemplateScheduleDialog } from "@/modules/imports/page/ImportTemplateScheduleDialog";
import { ImportTemplateSurfaceUrlDialog } from "@/modules/imports/page/ImportTemplateSurfaceUrlDialog";
import { looksLikeUuid } from "@/modules/imports/utils/looks-like-uuid";

type ImportTemplateSideDetailsProps = {
  importer: ImporterRow | null;
  onOpenChange: (open: boolean) => void;
};

function TemplateCardsSkeleton({ count = 3 }: { count?: number }) {
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

export function ImportTemplateSideDetails({
  importer,
  onOpenChange,
}: ImportTemplateSideDetailsProps) {
  const importerId = importer?.importerId ?? "";
  const [runsModalTemplate, setRunsModalTemplate] =
    useState<ImportTemplateListItem | null>(null);
  const [surfaceModalTemplate, setSurfaceModalTemplate] =
    useState<ImportTemplateListItem | null>(null);
  const [scheduleModalTemplate, setScheduleModalTemplate] =
    useState<ImportTemplateListItem | null>(null);

  const { data, loading, error } = useImportTemplatesForImporterQuery({
    skip: importer === null,
    variables: { importerId },
  });

  const templates = data?.importTemplatesForImporter ?? [];

  const showSkeleton = importer !== null && loading && !data;

  const clearDialogsForTemplate = useCallback((templateId: string) => {
    setRunsModalTemplate((t) => (t?.id === templateId ? null : t));
    setSurfaceModalTemplate((t) => (t?.id === templateId ? null : t));
    setScheduleModalTemplate((t) => (t?.id === templateId ? null : t));
  }, []);

  const patchRunsModalIfSame = useCallback(
    (id: string, patch: Partial<ImportTemplateListItem>) => {
      setRunsModalTemplate((t) => (t?.id === id ? { ...t, ...patch } : t));
    },
    [],
  );

  return (
    <SideDetails
      layout="inline"
      open={importer !== null}
      onOpenChange={onOpenChange}
      contentClassName={cn(
        "size-full min-h-0 min-w-0  max-w-none sm:max-w-none lg:h-full lg:max-w-none",
      )}
      title={importer ? `Templates · ${importer.name}` : undefined}
      accessibilityTitle={
        importer
          ? `Import templates for ${importer.name}`
          : "Import template details"
      }
      description={
        importer && !looksLikeUuid(importer.importerId) ? (
          <Text size="sm" color="secondary" className={cn("font-mono text-xs")}>
            {importer.importerId}
          </Text>
        ) : undefined
      }
    >
      {showSkeleton ? (
        <TemplateCardsSkeleton />
      ) : error ? (
        <Text size="sm" color="error">
          Failed to load templates. Try closing and opening again.
        </Text>
      ) : templates.length === 0 ? (
        <Text size="sm" color="secondary">
          No import templates for this importer.
        </Text>
      ) : (
        <Stack gap="sm" className={cn("min-w-0")}>
          {templates.map((template, templateIndex) => (
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
                  <button
                    type="button"
                    title="View runs for this template"
                    onClick={() => setRunsModalTemplate(template)}
                  >
                    Template {templateIndex + 1}
                  </button>
                </ListItemCard.Title>
              }
              actions={
                <ListItemCard.Actions>
                  <IconButton
                    intent="ghost"
                    size="sm"
                    label={`Edit listing URL for template ${templateIndex + 1}`}
                    tooltip="Edit surface URL"
                    className={cn(ListItemCard.actionIconButtonClassName)}
                    icon={<LinkSimpleIcon size={13} weight="regular" />}
                    onClick={() => setSurfaceModalTemplate(template)}
                  />
                  <IconButton
                    intent="ghost"
                    size="sm"
                    label={`Edit schedule for template ${templateIndex + 1}`}
                    tooltip="Edit schedule"
                    className={cn(ListItemCard.actionIconButtonClassName)}
                    icon={<ClockIcon size={13} weight="regular" />}
                    onClick={() => setScheduleModalTemplate(template)}
                  />
                  <DeleteImportTemplateDialog
                    trigger={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label={`Delete template ${templateIndex + 1}`}
                        tooltip="Delete template"
                        className={cn(ListItemCard.actionIconButtonClassName)}
                        icon={<TrashIcon size={13} weight="regular" />}
                      />
                    }
                    templateId={template.id}
                    importerId={importerId}
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
      )}
      <ImportTemplateRunsDialog
        template={runsModalTemplate}
        onOpenChange={(open) => {
          if (!open) setRunsModalTemplate(null);
        }}
      />
      <ImportTemplateSurfaceUrlDialog
        importerId={importerId}
        template={surfaceModalTemplate}
        onOpenChange={(open) => {
          if (!open) setSurfaceModalTemplate(null);
        }}
        onSurfaceSaved={(id, surfaceUrl) =>
          patchRunsModalIfSame(id, { surfaceUrl })
        }
      />
      <ImportTemplateScheduleDialog
        importerId={importerId}
        template={scheduleModalTemplate}
        onOpenChange={(open) => {
          if (!open) setScheduleModalTemplate(null);
        }}
        onScheduleSaved={(id, patch) => patchRunsModalIfSame(id, patch)}
      />
    </SideDetails>
  );
}
