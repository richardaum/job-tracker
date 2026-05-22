"use client";

import { tryRun } from "@job-tracker/try-run";
import { cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useState } from "react";

import type { JobsQuery } from "@/gql/hooks";
import { useFillJobAutomaticallyMutation } from "@/gql/hooks";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConfirmationDialog";
import { DeleteDraftJobDialog } from "@/modules/draft-jobs/list/components/DeleteDraftJobDialog";
import { ConversionStatusBadge } from "@/modules/draft-jobs/shared/components/ConversionStatusBadge";

type DraftListItem = JobsQuery["jobs"][number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

function draftDisplayUrl(urls: readonly string[]): string {
  const url =
    urls.length > 0 && urls[0]!.trim() !== "" ? urls[0]!.trim() : null;
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

  const [fillJobAutomatically] = useFillJobAutomaticallyMutation();
  const label = draft.title?.trim().length
    ? draft.title!.trim()
    : draftDisplayUrl(draft.urls);

  async function handleConvertToJob() {
    const [error] = await tryRun(
      fillJobAutomatically({ variables: { jobId: draft.id } }),
    );

    if (error) {
      onError?.(error.message || "Failed to start automatic fill.");
      return;
    }

    onSuccess?.("Automatic fill queued.");
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
        onSuccess={onSuccess}
        onError={onError}
      />
      <ConvertDraftConfirmationDialog
        open={convertConfirmDialogOpen}
        draftSummary={label}
        onOpenChange={setConvertConfirmDialogOpen}
        onConfirm={handleConvertToJob}
      />
    </ListItemCard.Actions>
  );

  const displayDate = draft.fillMetadata?.timestamp ?? draft.createdAt;
  const dateLabel = draft.fillMetadata?.timestamp ? "Updated at" : "Created at";
  const showSpinner =
    draft.fillMetadata?.status?.toLowerCase() === "processing";

  const meta = (
    <>
      <ConversionStatusBadge
        conversionMetadata={draft.fillMetadata}
        showSpinner={showSpinner}
      />
      <span className={cn("text-text-muted text-xs")}>
        {dateLabel} {formatDate(displayDate)}
      </span>
    </>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
