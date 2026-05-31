"use client";

import { EMPTY_TIPTAP_DOC } from "@job-tracker/tiptap";
import type { Editor } from "@tiptap/react";
import { type Ref, useCallback, useImperativeHandle } from "react";

export type TipTapEditorHandle = {
  /**
   * Clears the document (TipTap `clearContent(false)`) and syncs the parent via
   * `onChange(EMPTY_TIPTAP_DOC)` so React state matches the editor.
   */
  clear: () => void;
  /**
   * Inserts plain text at the cursor using TipTap transactions (same `onUpdate` path as real input).
   * Prefer this in tests over `user.type` on the ProseMirror root: jsdom often mutates the DOM
   * without dispatching updates ProseMirror listens to, so `onChange` never runs.
   */
  insertPlainText: (text: string) => void;
};

type UseTipTapEditorHandleOptions = {
  ref: Ref<TipTapEditorHandle> | undefined;
  editor: Editor | null;
  onChange: (nextValue: string) => void;
};

/**
 * Imperative API for `TipTapEditor`: wires `ref.clear()` via `useImperativeHandle`
 * and returns `clearDocument` for in-editor actions (e.g. toolbar Clear with focus).
 */
export function useTipTapEditorHandle({
  ref,
  editor,
  onChange,
}: UseTipTapEditorHandleOptions) {
  const clearDocument = useCallback(
    (focusEditor?: boolean) => {
      if (editor && !editor.isDestroyed) {
        if (focusEditor) {
          editor.chain().focus().clearContent(false).run();
        } else {
          editor.commands.clearContent(false);
        }
      }
      onChange(EMPTY_TIPTAP_DOC);
    },
    [editor, onChange],
  );

  const insertPlainText = useCallback(
    (text: string) => {
      if (!editor || editor.isDestroyed) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor],
  );

  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        clearDocument();
      },
      insertPlainText,
    }),
    [clearDocument, insertPlainText],
  );

  return { clearDocument };
}
