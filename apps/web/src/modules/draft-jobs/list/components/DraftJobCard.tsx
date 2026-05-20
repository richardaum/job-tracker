"use client";

import { tryRun } from "@job-tracker/try-run";
import { cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useState } from "react";

import {
  type DraftJobsListQuery,
  useCreateJobWithAiMutation,
} from "@/gql/hooks";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConfirmationDialog";
import { ConvertDraftConflictDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConflictDialog";
import { DeleteDraftJobDialog } from "@/modules/draft-jobs/list/components/DeleteDraftJobDialog";
import { ConversionStatusBadge } from "@/modules/draft-jobs/shared/components/ConversionStatusBadge";

type DraftListItem = DraftJobsListQuery["draftJobs"][number];

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

interface DraftJobCardProps {
  draft: DraftListItem;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DraftJobCard({ draft, onSuccess, onError }: DraftJobCardProps) {
  const [convertConfirmDialogOpen, setConvertConfirmDialogOpen] =
    useState(false);
  const [convertConflictDialogOpen, setConvertConflictDialogOpen] =
    useState(false);
  const [createJobWithAI] = useCreateJobWithAiMutation();
  const label = draft.title.trim() || draftDisplayUrl(draft.url);

  async function handleConvertToJob() {
    if (draft.jobId) {
      setConvertConflictDialogOpen(true);
      return;
    }

    const [error] = await tryRun(
      createJobWithAI({ variables: { draftId: draft.id } }),
    );

    if (error) {
      onError?.(error.message || "Failed to start draft conversion.");
      return;
    }

    onSuccess?.("Conversion started in background.");
  }

  const title = (
    <ListItemCard.Title size="sm" asChild>
      <NextLink
        href={`/draft-jobs/${draft.id}`}
        className={cn("font-semibold")}
      >
        {label}
      </NextLink>
    </ListItemCard.Title>
  );

  const actions = (
    <ListItemCard.Actions>
      <IconButton
        intent="ghost"
        size="sm"
        label={`Convert draft ${label} to job`}
        tooltip="Convert to job"
        className={cn(
          ListItemCard.actionIconButtonClassName,
          "hover:text-text-brand",
        )}
        icon={<ArrowsClockwiseIcon size={13} weight="regular" />}
        onClick={() => {
          setConvertConfirmDialogOpen(true);
        }}
      />
      <DeleteDraftJobDialog
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
        hasLinkedJob={Boolean(draft.jobId)}
        onSuccess={onSuccess}
        onError={onError}
      />
      <ConvertDraftConflictDialog
        open={convertConflictDialogOpen}
        draftId={draft.id}
        previousJobId={draft.jobId ?? null}
        onOpenChange={setConvertConflictDialogOpen}
        onDeletePreviousSuccess={() => {
          onSuccess?.("Linked jobs removed for this draft.");
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
        onConfirm={handleConvertToJob}
      />
    </ListItemCard.Actions>
  );

  const displayDate = draft.conversionMetadata?.timestamp ?? draft.createdAt;
  const dateLabel = draft.conversionMetadata?.timestamp
    ? "Converted at"
    : "Created at";

  const meta = (
    <>
      <ConversionStatusBadge conversionMetadata={draft.conversionMetadata} />
      <span className={cn("text-text-muted text-xs")}>
        {dateLabel} {formatDate(displayDate)}
      </span>
    </>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
