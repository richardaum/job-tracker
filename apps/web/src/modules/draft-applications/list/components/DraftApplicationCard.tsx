"use client";

import { tryRun } from "@job-tracker/try-run";
import { cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useState } from "react";

import {
  type DraftApplicationsListQuery,
  useCreateApplicationWithAIMutation,
} from "@/gql/hooks";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-applications/details/components/ConvertDraftConfirmationDialog";
import { ConvertDraftConflictDialog } from "@/modules/draft-applications/details/components/ConvertDraftConflictDialog";
import { DeleteDraftApplicationDialog } from "@/modules/draft-applications/list/components/DeleteDraftApplicationDialog";
import { ConversionStatusBadge } from "@/modules/draft-applications/shared/components/ConversionStatusBadge";

export type DraftListItem =
  DraftApplicationsListQuery["draftApplications"][number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

function draftDisplayUrl(url: string | null | undefined): string {
  if (!url) return "—";
  const [err, joined] = tryRun(() => {
    const u = new URL(url);
    const path = u.pathname.length > 1 ? u.pathname : "";
    const j = `${u.hostname}${path}`;
    return j.length > 96 ? `${j.slice(0, 93)}…` : j;
  });
  if (!err) {
    return joined;
  }
  return url.length > 96 ? `${url.slice(0, 93)}…` : url;
}

interface DraftApplicationCardProps {
  draft: DraftListItem;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DraftApplicationCard({
  draft,
  onSuccess,
  onError,
}: DraftApplicationCardProps) {
  const [convertConfirmDialogOpen, setConvertConfirmDialogOpen] =
    useState(false);
  const [convertConflictDialogOpen, setConvertConflictDialogOpen] =
    useState(false);
  const [createApplicationWithAI] = useCreateApplicationWithAIMutation();
  const label = draft.title.trim() || draftDisplayUrl(draft.url);

  async function handleConvertToApplication() {
    if (draft.applicationId) {
      setConvertConflictDialogOpen(true);
      return;
    }

    const [error] = await tryRun(
      createApplicationWithAI({ variables: { draftId: draft.id } }),
    );

    if (error) {
      onError?.(error.message || "Failed to start draft conversion.");
      return;
    }

    onSuccess?.("Conversion started in background.");
  }

  const title = (
    <ListItemCard.Title asChild size="sm" className={cn("font-semibold")}>
      <NextLink href={`/draft-applications/${draft.id}`}>
        <span className={cn("inline-flex items-center gap-2")}>
          <span>{label}</span>
          <ConversionStatusBadge
            conversionStatus={draft.conversionStatus}
            conversionError={draft.conversionError}
          />
        </span>
      </NextLink>
    </ListItemCard.Title>
  );

  const actions = (
    <ListItemCard.Actions>
      <IconButton
        intent="ghost"
        size="sm"
        label={`Convert draft ${label} to application`}
        tooltip="Convert to application"
        className={cn(
          ListItemCard.actionIconButtonClassName,
          "hover:text-text-brand",
        )}
        icon={<ArrowsClockwiseIcon size={13} weight="regular" />}
        onClick={() => {
          setConvertConfirmDialogOpen(true);
        }}
      />
      <DeleteDraftApplicationDialog
        trigger={
          <IconButton
            intent="ghost"
            size="sm"
            label={`Delete draft ${label}`}
            tooltip="Delete draft"
            className={cn(
              ListItemCard.actionIconButtonClassName,
              "hover:text-text-error",
            )}
            icon={<TrashIcon size={13} weight="regular" />}
          />
        }
        draftId={draft.id}
        draftSummary={label}
        hasLinkedApplication={Boolean(draft.applicationId)}
        onSuccess={onSuccess}
        onError={onError}
      />
      <ConvertDraftConflictDialog
        open={convertConflictDialogOpen}
        draftId={draft.id}
        previousApplicationId={draft.applicationId ?? null}
        onOpenChange={setConvertConflictDialogOpen}
        onDeletePreviousSuccess={() => {
          onSuccess?.("Linked applications removed for this draft.");
        }}
        onConversionSuccess={() => {
          onSuccess?.("Conversion started in background.");
        }}
        onError={(message) => {
          onError?.(message);
        }}
      />
      <ConvertDraftConfirmationDialog
        open={convertConfirmDialogOpen}
        draftSummary={label}
        onOpenChange={setConvertConfirmDialogOpen}
        onConfirm={handleConvertToApplication}
      />
    </ListItemCard.Actions>
  );

  const displayDate = draft.convertedAt ?? draft.createdAt;
  const dateLabel = draft.convertedAt ? "Converted at" : "Created at";

  const meta = (
    <span className={cn("text-text-muted text-xs")}>
      {dateLabel} {formatDate(displayDate)}
    </span>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
