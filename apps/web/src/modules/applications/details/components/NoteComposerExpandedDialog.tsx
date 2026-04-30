"use client";

import React from "react";
import { Button, Dialog, Stack, cn } from "@job-tracker/ui";
import type { TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";
import { EMPTY_TIPTAP_DOC } from "@/modules/applications/shared/utils/tiptap";
import { TipTapEditor } from "./TipTapEditor";

interface NoteComposerExpandedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  isModalInstance: boolean;
  draftNote: string;
  onDraftNoteChange: (nextValue: string) => void;
  canSend: boolean;
  creatingNote: boolean;
  onSendNote: () => Promise<void>;
  composerAiActions: TipTapAiAction[];
  onCollapse: () => void;
}

export function NoteComposerExpandedDialog({
  open,
  onOpenChange,
  applicationId,
  isModalInstance,
  draftNote,
  onDraftNoteChange,
  canSend,
  creatingNote,
  onSendNote,
  composerAiActions,
  onCollapse,
}: NoteComposerExpandedDialogProps) {
  return (
    <Dialog
      title="New note"
      open={open}
      onOpenChange={onOpenChange}
      trigger={<span aria-hidden style={{ display: "none" }} />}
      contentClassName={cn("h-[90vh] w-[90vw] max-w-none p-4")}
      childrenClassName={cn("flex min-h-0 flex-col")}
    >
      <Stack gap="sm" className={cn("flex-1 min-h-0")}>
        <div className={cn("flex-1 min-h-0")}>
          <TipTapEditor
            id={`application-note-composer-expanded-${applicationId}${isModalInstance ? "-modal" : ""}`}
            value={draftNote}
            onChange={(nextValue) =>
              onDraftNoteChange(nextValue || EMPTY_TIPTAP_DOC)
            }
            onHardEnter={canSend ? () => void onSendNote() : undefined}
            placeholder="Write a note..."
            disabled={creatingNote}
            autofocus="end"
            fillHeight
            aiActions={composerAiActions}
            showExpandButton
            expandButtonAriaLabel="Close expanded note composer"
            onExpandClick={onCollapse}
          />
        </div>
        <div className={cn("flex justify-end")}>
          <Button
            size="sm"
            intent="primary"
            onClick={() => void onSendNote()}
            disabled={!canSend}
            state={creatingNote ? "loading" : "default"}
          >
            Send
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
