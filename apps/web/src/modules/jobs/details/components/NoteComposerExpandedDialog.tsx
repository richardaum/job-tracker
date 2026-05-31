"use client";

import { EMPTY_TIPTAP_DOC } from "@job-tracker/tiptap";
import { Button, cn, Dialog, Stack } from "@job-tracker/ui";

import { useImproveJobNoteAiAction } from "@/modules/ai/actions/useImproveJobNoteAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";

import { TipTapEditor } from "./TipTapEditor";

interface NoteComposerExpandedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  isDialogInstance: boolean;
  draftNote: string;
  onDraftNoteChange: (nextValue: string) => void;
  canSend: boolean;
  creatingNote: boolean;
  onSendNote: () => Promise<void>;
}

export function NoteComposerExpandedDialog({
  open,
  onOpenChange,
  jobId,
  isDialogInstance,
  draftNote,
  onDraftNoteChange,
  canSend,
  creatingNote,
  onSendNote,
}: NoteComposerExpandedDialogProps) {
  const improveNoteAction = useImproveJobNoteAiAction({
    jobId,
    disabled: !canSend,
  });
  const rewriteTextAction = useRewriteTextAiAction({ disabled: !canSend });

  return (
    <Dialog
      title="New note"
      description="Compose a detailed note for this job in an expanded editor."
      open={open}
      onOpenChange={onOpenChange}
      contentClassName={cn("h-[90vh] w-[90vw] max-w-none p-4")}
      childrenClassName={cn("flex min-h-0 flex-col")}
    >
      <Stack gap="sm" className={cn("flex-1 min-h-0")}>
        <div className={cn("flex-1 min-h-0")}>
          <TipTapEditor
            id={`job-note-composer-expanded-${jobId}${isDialogInstance ? "-dialog" : ""}`}
            value={draftNote}
            onChange={(nextValue) =>
              onDraftNoteChange(nextValue || EMPTY_TIPTAP_DOC)
            }
            onHardEnter={canSend ? () => void onSendNote() : undefined}
            placeholder="Write a note..."
            disabled={creatingNote}
            autofocus="end"
            fillHeight
            aiActions={[improveNoteAction, rewriteTextAction]}
            showExpandButton
            expandButtonAriaLabel="Close expanded note composer"
            onExpandClick={() => onOpenChange(false)}
          />
        </div>
        <div className={cn("flex justify-end")}>
          <Button
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
