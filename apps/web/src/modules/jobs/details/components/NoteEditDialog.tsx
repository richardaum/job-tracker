"use client";

import { tipTapToPlainText } from "@job-tracker/tiptap";
import { Button, cn, Dialog, Stack } from "@job-tracker/ui";
import React, { useMemo } from "react";

import { useImproveJobNoteAiAction } from "@/modules/ai/actions/useImproveJobNoteAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";

import { TipTapEditor } from "./TipTapEditor";

interface EditableNote {
  id: string;
  revision: number;
}

interface NoteEditDialogProps {
  jobId: string;
  note: EditableNote | null;
  editingNoteContent: string;
  onEditingNoteContentChange: (nextValue: string) => void;
  updatingNote: boolean;
  deletingNote: boolean;
  onClose: () => void;
  onSave: (payload: { noteId: string; content: string; expectedRevision: number }) => Promise<void>;
}

export function NoteEditDialog({
  jobId,
  note,
  editingNoteContent,
  onEditingNoteContentChange,
  updatingNote,
  deletingNote,
  onClose,
  onSave,
}: NoteEditDialogProps) {
  const editImproveNoteAction = useImproveJobNoteAiAction({
    jobId,
    disabled: !note || updatingNote || deletingNote,
  });
  const editRewriteTextAction = useRewriteTextAiAction({
    disabled: !note || updatingNote || deletingNote,
  });
  const editAiActions = useMemo(
    () => [editImproveNoteAction, editRewriteTextAction],
    [editImproveNoteAction, editRewriteTextAction],
  );
  const canSaveEdit =
    Boolean(note) && tipTapToPlainText(editingNoteContent).trim().length > 0 && !updatingNote;

  async function handleSave() {
    if (!note || !canSaveEdit) return;
    await onSave({
      noteId: note.id,
      content: editingNoteContent,
      expectedRevision: note.revision,
    });
  }

  return (
    <Dialog
      title="Edit note"
      description="Revise this note content before saving your changes."
      open={Boolean(note)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      contentClassName={cn("max-w-3xl")}
    >
      <Stack gap="sm">
        <div className={cn("h-[55vh] min-h-[360px] w-full min-w-[320px]")}>
          <TipTapEditor
            id={`job-note-editor-${note?.id ?? "none"}`}
            value={editingNoteContent}
            onChange={onEditingNoteContentChange}
            placeholder="Edit note..."
            disabled={updatingNote}
            autofocus="end"
            fillHeight
            aiActions={editAiActions}
          />
        </div>
        <div className={cn("flex items-center justify-end gap-2")}>
          <Button intent="ghost" onClick={onClose} disabled={updatingNote || deletingNote}>
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={() => void handleSave()}
            disabled={!canSaveEdit || deletingNote}
            state={updatingNote ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
