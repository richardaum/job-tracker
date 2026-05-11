"use client";

import { tryRun } from "@job-tracker/try-run";
import { cn, IconButton, ListItemCard, Text } from "@job-tracker/ui";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";
/* MOCK DATA: imports below will change to real types from @/gql/hooks
   when T-176 is complete.
   - MockResume → generated Resume type
   - Delete dialog will connect to real mutation
   - onEdit will open real editor (T-179) */
import type { MockResume } from "@/modules/resumes/list/hooks/useMockResumes";

function formatDate(iso: string): string {
  const [err, formatted] = tryRun(() =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso)),
  );
  if (!err) return formatted;
  return iso;
}

/* MOCK DATA: remove this whole prop and let callers pass
   the real (generated) type when T-176 lands. */
interface ResumeCardProps {
  resume: MockResume;
  /* MOCK DATA: real callbacks will come from mutations */
  onSuccess?: (message: string) => void;
}

export function ResumeCard({ resume, onSuccess }: ResumeCardProps) {
  /* MOCK DATA: replace with real mutation calls (T-180) */

  const descriptionPreview = tipTapToPlainText(resume.content).slice(0, 120);

  const title = (
    <ListItemCard.Title asChild size="sm" className={cn("font-semibold")}>
      <NextLink href={`/resumes/${resume.id}`}>
        <span>{resume.title}</span>
      </NextLink>
    </ListItemCard.Title>
  );

  const actions = (
    <ListItemCard.Actions>
      {/* MOCK DATA: wire onEdit to real editor dialog (T-179) */}
      <IconButton
        intent="ghost"
        size="sm"
        label={`Edit resume "${resume.title}"`}
        tooltip="Edit resume"
        className={cn(
          ListItemCard.actionIconButtonClassName,
          "hover:text-text-brand",
        )}
        icon={<PencilSimpleIcon size={13} weight="regular" />}
        onClick={() => {
          onSuccess?.("Edit clicked — handler pending (T-179)");
        }}
      />
      {/* MOCK DATA: replace with real delete mutation + confirmation dialog */}
      <IconButton
        intent="ghost"
        size="sm"
        label={`Delete resume "${resume.title}"`}
        tooltip="Delete resume"
        className={cn(
          ListItemCard.actionIconButtonClassName,
          "hover:text-text-error",
        )}
        icon={<TrashIcon size={13} weight="regular" />}
        onClick={() => {
          const ok = window.confirm(`Delete "${resume.title}"?`);
          if (ok) {
            onSuccess?.(`"${resume.title}" deleted (mock)`);
          }
        }}
      />
    </ListItemCard.Actions>
  );

  const meta = (
    <Text as="span" size="xs" color="muted">
      Updated {formatDate(resume.updatedAt)}
      {resume.preferences.length > 0 && (
        <>
          <span className={cn("mx-1.5 text-border-default")}>·</span>
          {resume.preferences.length} preference
          {resume.preferences.length !== 1 ? "s" : ""}
        </>
      )}
    </Text>
  );

  const description = descriptionPreview ? (
    <Text size="sm" color="muted" className={cn("line-clamp-2")}>
      {descriptionPreview}
    </Text>
  ) : null;

  return (
    <ListItemCard
      title={title}
      actions={actions}
      meta={meta}
      description={description}
    />
  );
}
