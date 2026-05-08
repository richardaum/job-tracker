"use client";

import {
  Button,
  cn,
  IconButton,
  Stack,
  TabsContent,
  Text,
} from "@job-tracker/ui";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import React, { useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  ApplicationNotesDocument,
  useApplicationNotesQuery,
  useCreateApplicationNoteMutation,
  useDeleteApplicationNoteMutation,
  useUpdateApplicationNoteMutation,
} from "@/gql/hooks";
import { useImproveApplicationNoteAiAction } from "@/modules/ai/actions/useImproveApplicationNoteAiAction";
import { useRewriteTextAiAction } from "@/modules/ai/actions/useRewriteTextAiAction";
import { useNotesComposerBehavior } from "@/modules/applications/details/hooks/useNotesComposerBehavior";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";
import { TipTapContent } from "@/modules/applications/shared/components/TipTapContent";
import {
  EMPTY_TIPTAP_DOC,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

import { NoteComposerExpandedDialog } from "./NoteComposerExpandedDialog";
import { NoteDeleteConfirmDialog } from "./NoteDeleteConfirmDialog";
import { NoteEditDialog } from "./NoteEditDialog";
import { TipTapEditor, type TipTapEditorHandle } from "./TipTapEditor";

export function NotesPanel({
  applicationId,
  isModalInstance = false,
}: {
  applicationId: string;
  isModalInstance?: boolean;
}) {
  const [draftNote, setDraftNote] = useState(EMPTY_TIPTAP_DOC);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const composerEditorRef = useRef<TipTapEditorHandle>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] =
    useState(EMPTY_TIPTAP_DOC);
  const [noteIdPendingDelete, setNoteIdPendingDelete] = useState<string | null>(
    null,
  );

  const { data: notesData } = useApplicationNotesQuery({
    variables: { applicationId },
    fetchPolicy: "cache-and-network",
  });
  const [createApplicationNote, { loading: creatingNote }] =
    useCreateApplicationNoteMutation({
      refetchQueries: [
        { query: ApplicationNotesDocument, variables: { applicationId } },
      ],
    });
  const [updateApplicationNote, { loading: updatingNote }] =
    useUpdateApplicationNoteMutation({
      refetchQueries: [
        { query: ApplicationNotesDocument, variables: { applicationId } },
      ],
    });
  const [deleteApplicationNote, { loading: deletingNote }] =
    useDeleteApplicationNoteMutation({
      refetchQueries: [
        { query: ApplicationNotesDocument, variables: { applicationId } },
      ],
    });

  const applicationNotes = useMemo(
    () =>
      (notesData?.applicationNotes ?? [])
        .map((note) => ({
          ...note,
          text: tipTapToPlainText(note.content).trim(),
        }))
        .filter((note) => note.text.length > 0)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [notesData?.applicationNotes],
  );
  const canSend =
    tipTapToPlainText(draftNote).trim().length > 0 && !creatingNote;
  const editingNote = useMemo(
    () => applicationNotes.find((note) => note.id === editingNoteId) ?? null,
    [applicationNotes, editingNoteId],
  );
  const composerImproveNoteAction = useImproveApplicationNoteAiAction({
    applicationId,
    disabled: !canSend,
  });
  const composerRewriteTextAction = useRewriteTextAiAction({
    disabled: !canSend,
  });

  const { notesEndRef, handleNoteSent } = useNotesComposerBehavior({
    hasLoadedMessages: Boolean(notesData),
    notesCount: applicationNotes.length,
  });

  async function handleSendNote() {
    if (!canSend) return;
    const noteContent = draftNote;
    composerEditorRef.current?.clear();

    try {
      await createApplicationNote({
        variables: { input: { applicationId, content: noteContent } },
      });
      handleNoteSent();
    } catch {
      // Restore draft so user can retry.
      setDraftNote(noteContent);
    }
  }

  function handleStartEditNote(noteId: string) {
    setEditingNoteId(noteId);
    const selectedNote = applicationNotes.find((note) => note.id === noteId);
    setEditingNoteContent(selectedNote?.content || EMPTY_TIPTAP_DOC);
  }

  function handleCancelEditNote() {
    setEditingNoteId(null);
    setEditingNoteContent(EMPTY_TIPTAP_DOC);
  }

  async function handleSaveEditNote(payload: {
    noteId: string;
    content: string;
    expectedRevision: number;
  }) {
    try {
      await updateApplicationNote({
        variables: {
          id: payload.noteId,
          input: {
            content: payload.content,
            expectedRevision: payload.expectedRevision,
          },
        },
      });
      handleCancelEditNote();
    } catch {
      // Keep draft in place so user can retry.
    }
  }

  async function confirmDeleteNote() {
    if (!noteIdPendingDelete) {
      throw new Error("No note selected for delete");
    }
    const noteId = noteIdPendingDelete;
    await deleteApplicationNote({ variables: { id: noteId } });
    if (editingNoteId === noteId) {
      handleCancelEditNote();
    }
  }

  return (
    <>
      <div className={cn("flex h-full min-h-0 flex-col")}>
        <div className={cn("min-h-0 flex-1 overflow-auto")}>
          {applicationNotes.length === 0 ? (
            <EmptyState variant="panel" message="No application notes yet." />
          ) : (
            <Stack gap="xs">
              {applicationNotes.map((note) => (
                <div key={note.id} className={cn("flex justify-start")}>
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl rounded-bl-sm border border-border-subtle bg-bg-surface-hover px-3 py-2",
                    )}
                  >
                    <Stack gap="xs">
                      <div
                        className={cn(
                          "text-sm whitespace-pre-wrap wrap-break-word [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-text-brand [&_a]:underline",
                        )}
                      >
                        <TipTapContent content={note.content} />
                      </div>
                      <div
                        className={cn(
                          "flex items-center justify-between gap-2",
                        )}
                      >
                        <Text size="xs" color="muted">
                          {formatDateTime(note.createdAt)}
                        </Text>
                        <div className={cn("flex items-center gap-1")}>
                          <IconButton
                            size="sm"
                            intent="ghost"
                            label="Edit note"
                            tooltip="Edit note"
                            icon={
                              <PencilSimpleIcon size={13} weight="regular" />
                            }
                            className={cn(
                              "size-6  text-text-muted/80 hover:text-text-muted",
                            )}
                            onClick={() => handleStartEditNote(note.id)}
                            disabled={
                              creatingNote || updatingNote || deletingNote
                            }
                          />
                          <IconButton
                            size="sm"
                            intent="ghost"
                            label="Delete note"
                            tooltip="Delete note"
                            icon={<TrashIcon size={13} weight="regular" />}
                            className={cn(
                              "size-6  text-text-muted/80 hover:text-text-muted",
                            )}
                            onClick={() => setNoteIdPendingDelete(note.id)}
                            disabled={
                              creatingNote || updatingNote || deletingNote
                            }
                          />
                        </div>
                      </div>
                    </Stack>
                  </div>
                </div>
              ))}
              <div ref={notesEndRef} />
            </Stack>
          )}
        </div>

        <div className={cn("mt-2 pt-2")}>
          <Stack gap="xs">
            <TipTapEditor
              ref={composerEditorRef}
              id={`application-note-composer-${applicationId}${isModalInstance ? "-modal" : ""}`}
              value={draftNote}
              onChange={(nextValue) =>
                setDraftNote(nextValue || EMPTY_TIPTAP_DOC)
              }
              onHardEnter={canSend ? () => void handleSendNote() : undefined}
              placeholder="Write a note..."
              disabled={creatingNote}
              autofocus={true}
              contentClassName={cn(
                "min-h-0 [&_.ProseMirror]:min-h-5 [&_.ProseMirror]:max-h-40 [&_.ProseMirror]:overflow-y-auto",
              )}
              aiActions={[composerImproveNoteAction, composerRewriteTextAction]}
              showExpandButton
              expandButtonAriaLabel="Expand note composer"
              onExpandClick={() => setIsComposerExpanded(true)}
            />
            <div className={cn("flex justify-end")}>
              <Button
                size="md"
                intent="primary"
                onClick={() => void handleSendNote()}
                disabled={!canSend}
                state={creatingNote ? "loading" : "default"}
              >
                Send
              </Button>
            </div>
          </Stack>
        </div>
      </div>
      <NoteDeleteConfirmDialog
        open={noteIdPendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setNoteIdPendingDelete(null);
        }}
        onConfirm={confirmDeleteNote}
      />
      <NoteComposerExpandedDialog
        open={isComposerExpanded}
        onOpenChange={setIsComposerExpanded}
        applicationId={applicationId}
        isModalInstance={isModalInstance}
        draftNote={draftNote}
        onDraftNoteChange={setDraftNote}
        canSend={canSend}
        creatingNote={creatingNote}
        onSendNote={handleSendNote}
      />
      <NoteEditDialog
        applicationId={applicationId}
        note={
          editingNote
            ? { id: editingNote.id, revision: editingNote.revision }
            : null
        }
        editingNoteContent={editingNoteContent}
        onEditingNoteContentChange={(nextValue) =>
          setEditingNoteContent(nextValue || EMPTY_TIPTAP_DOC)
        }
        updatingNote={updatingNote}
        deletingNote={deletingNote}
        onClose={handleCancelEditNote}
        onSave={handleSaveEditNote}
      />
    </>
  );
}

export function NotesPanelTabsContent({
  applicationId,
  className,
}: {
  applicationId: string;
  className?: string;
}) {
  return (
    <TabsContent
      value="notes"
      className={cn("flex-1 min-h-0 overflow-hidden", className)}
    >
      <NotesPanel applicationId={applicationId} />
    </TabsContent>
  );
}
