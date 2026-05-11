"use client";

import { tryRun } from "@job-tracker/try-run";
import { cn, IconButton, ListItemCard, Text } from "@job-tracker/ui";
import { TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import type { ResumeType } from "@/gql/hooks";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";
import { DeleteResumeDialog } from "@/modules/resumes/list/components/DeleteResumeDialog";

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

interface ResumeCardProps {
  resume: Pick<ResumeType, "id" | "title" | "content" | "updatedAt">;
  onDelete?: (id: string, title: string) => void;
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
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
      <DeleteResumeDialog
        resumeId={resume.id}
        resumeTitle={resume.title}
        onConfirm={() => onDelete?.(resume.id, resume.title)}
        trigger={
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
          />
        }
      />
    </ListItemCard.Actions>
  );

  const meta = (
    <Text as="span" size="xs" color="muted">
      Updated {formatDate(resume.updatedAt)}
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
