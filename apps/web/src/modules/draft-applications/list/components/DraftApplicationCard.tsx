"use client";

import { captureSync, to } from "@job-tracker/async";
import { Badge, cn, IconButton, ListItemCard, Text } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useState } from "react";

import {
  type DraftApplicationsListQuery,
  useCreateApplicationWithAiV2Mutation,
} from "@/gql/hooks";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-applications/details/components/ConvertDraftConfirmationDialog";
import { ConvertDraftConflictDialog } from "@/modules/draft-applications/details/components/ConvertDraftConflictDialog";
import { DeleteDraftApplicationDialog } from "@/modules/draft-applications/list/components/DeleteDraftApplicationDialog";

export type DraftListItem =
  DraftApplicationsListQuery["draftApplications"][number];

function formatConversionStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "Processing";
  if (normalized === "succeeded") return "Succeeded";
  if (normalized === "failed") return "Failed";
  return "Idle";
}

function conversionStatusBadgeIntent(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "processing") return "warning" as const;
  if (normalized === "succeeded") return "success" as const;
  if (normalized === "failed") return "error" as const;
  return "default" as const;
}

function draftDisplayUrl(url: string): string {
  const [err, joined] = captureSync(() => {
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
  const [createApplicationWithAiV2] = useCreateApplicationWithAiV2Mutation();
  const label = draft.title.trim() || draftDisplayUrl(draft.url);

  async function handleConvertToApplication() {
    if (draft.applicationId) {
      setConvertConflictDialogOpen(true);
      return;
    }

    const [error] = await to(
      createApplicationWithAiV2({ variables: { draftId: draft.id } }),
    );

    if (error) {
      onError?.(error.message || "Failed to start draft conversion.");
      return;
    }

    onSuccess?.("Conversion started in background.");
  }

  const title = (
    <NextLink
      href={`/draft-applications/${draft.id}`}
      className={cn(
        "text-sm font-semibold text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 rounded-sm",
      )}
    >
      <span className={cn("inline-flex items-center gap-2")}>
        <span>{label}</span>
        <Badge intent={conversionStatusBadgeIntent(draft.conversionStatus)}>
          {formatConversionStatus(draft.conversionStatus)}
        </Badge>
      </span>
    </NextLink>
  );

  const actions = (
    <div className={cn("flex items-center gap-1")}>
      <IconButton
        intent="ghost"
        size="sm"
        label={`Convert draft ${label} to application`}
        tooltip="Convert to application"
        className={cn("size-6 text-text-muted/80 hover:text-text-brand")}
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
            className={cn("size-6 text-text-muted/80 hover:text-text-error")}
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
          onSuccess?.("Previous application deleted.");
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
    </div>
  );

  const meta = (
    <Text
      as="span"
      size="xs"
      color="muted"
      className={cn("min-w-0 truncate font-mono")}
    >
      {draft.id}
    </Text>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
