"use client";

import React from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { cn } from "@job-tracker/ui";
import { useHasVerticalOverflow } from "@/modules/applications/shared/hooks/useHasVerticalOverflow";
import {
  useTipTapEditorHandle,
  type TipTapEditorHandle,
} from "@/modules/applications/details/hooks/useTipTapEditorHandle";
import {
  normalizeTipTapDocument,
  parseTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

export type { TipTapEditorHandle } from "@/modules/applications/details/hooks/useTipTapEditorHandle";

interface TipTapEditorProps {
  ref?: React.Ref<TipTapEditorHandle>;
  id?: string;
  value: string | null | undefined;
  onChange: (nextValue: string) => void;
  onHardEnter?: () => void;
  placeholder?: string;
  disabled?: boolean;
  fillHeight?: boolean;
  contentClassName?: string;
}

function ToolbarButton({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded px-2 py-1 text-xs transition-colors border",
        active
          ? "border-border-brand bg-bg-brand-subtle text-text-brand"
          : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}

export function TipTapEditor({
  ref,
  id,
  value,
  onChange,
  onHardEnter,
  placeholder = "Write...",
  disabled = false,
  fillHeight = false,
  contentClassName,
}: TipTapEditorProps) {
  const onHardEnterRef = React.useRef(onHardEnter);
  React.useLayoutEffect(() => {
    onHardEnterRef.current = onHardEnter;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: parseTipTapDocument(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      handleKeyDown(_view, event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          onHardEnterRef.current?.();
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: nextEditor }) {
      onChange(JSON.stringify(nextEditor.getJSON()));
    },
  });

  // Controlled `value` / `disabled`: keep editor in sync when the parent changes data
  // (restore draft, edit dialog, description tab). Prefer `ref.clear()` to empty the composer.
  // Avoid `setContent` while the editor is ahead of React `value` (common during RTL `user.type`
  // and fast typing); see https://github.com/ueberdosis/tiptap/discussions/4008
  React.useEffect(() => {
    if (!editor) return;
    const incoming = normalizeTipTapDocument(value);
    const current = JSON.stringify(editor.getJSON());
    if (incoming !== current) {
      const plainIn = tipTapToPlainText(incoming).trim();
      const plainCur = tipTapToPlainText(current).trim();
      const editorAheadWhileFocused =
        editor.isFocused && plainCur.length > plainIn.length;
      const samePlainDifferentJson = plainIn === plainCur && plainIn.length > 0;
      if (!editorAheadWhileFocused && !samePlainDifferentJson) {
        editor.commands.setContent(parseTipTapDocument(value), {
          emitUpdate: false,
        });
      }
    }
    const nextEditable = !disabled;
    if (editor.isEditable !== nextEditable) {
      editor.setEditable(nextEditable);
    }
  }, [editor, value, disabled]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e?.isActive("bold"),
      isItalic: e?.isActive("italic"),
      isBulletList: e?.isActive("bulletList"),
    }),
  });

  const { clearDocument } = useTipTapEditorHandle({
    ref,
    editor,
    onChange,
  });

  const hasVerticalOverflow = useHasVerticalOverflow(
    (editor?.view.dom as HTMLElement | undefined) ?? null,
    {
      subscribe: editor
        ? (syncOverflowState) => {
            editor.on("update", syncOverflowState);
            return () => editor.off("update", syncOverflowState);
          }
        : undefined,
    },
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-24 rounded-md border border-border-subtle bg-bg-surface p-3 text-sm text-text-muted",
        )}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md bg-bg-surface",
        fillHeight && "flex h-full min-h-0 flex-col overflow-hidden",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap gap-1 rounded-t-md border border-border-subtle p-2",
        )}
      >
        <ToolbarButton
          label="B"
          active={editorState?.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="I"
          active={editorState?.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="List"
          active={editorState?.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="Clear"
          onClick={() => {
            clearDocument(true);
          }}
          disabled={disabled}
        />
      </div>
      <EditorContent
        editor={editor}
        id={id}
        className={cn(
          "min-h-24 rounded-b-md border border-border-subtle border-t-0 [&_.ProseMirror]:min-h-20 [&_.ProseMirror]:p-3 [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:wrap-break-word [&_.ProseMirror_a]:text-text-brand [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2 [&_.ProseMirror_a:hover]:text-text-brand-hover [&_.ProseMirror_a:focus-visible]:rounded-xs [&_.ProseMirror_a:focus-visible]:outline-none [&_.ProseMirror_a:focus-visible]:ring-2 [&_.ProseMirror_a:focus-visible]:ring-border-brand [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-text-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          hasVerticalOverflow && "border-r-0",
          fillHeight &&
            "flex-1 min-h-0 overflow-hidden [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:overflow-y-auto",
          contentClassName,
        )}
      />
    </div>
  );
}
