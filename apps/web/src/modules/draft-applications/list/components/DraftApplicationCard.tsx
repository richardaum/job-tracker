"use client";

import { cn, IconButton, ListItemCard, Text } from "@job-tracker/ui";
import { TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import type { DraftApplicationsListQuery } from "@/gql/hooks";
import { DeleteDraftApplicationDialog } from "@/modules/draft-applications/list/components/DeleteDraftApplicationDialog";

export type DraftListItem =
  DraftApplicationsListQuery["draftApplications"][number];

function draftDisplayUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 1 ? u.pathname : "";
    const joined = `${u.hostname}${path}`;
    return joined.length > 96 ? `${joined.slice(0, 93)}…` : joined;
  } catch {
    return url.length > 96 ? `${url.slice(0, 93)}…` : url;
  }
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
  const label = draft.title.trim() || draftDisplayUrl(draft.url);
  const title = (
    <NextLink
      href={`/draft-applications/${draft.id}`}
      className={cn(
        "text-sm font-semibold text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 rounded-sm",
      )}
    >
      {label}
    </NextLink>
  );

  const actions = (
    <DeleteDraftApplicationDialog
      trigger={
        <IconButton
          intent="ghost"
          size="sm"
          label={`Delete draft ${label}`}
          tooltip="Delete draft"
          className={cn("size-6  text-text-muted/80 hover:text-text-error")}
          icon={<TrashIcon size={13} weight="regular" />}
        />
      }
      draftId={draft.id}
      draftSummary={label}
      onSuccess={onSuccess}
      onError={onError}
    />
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
