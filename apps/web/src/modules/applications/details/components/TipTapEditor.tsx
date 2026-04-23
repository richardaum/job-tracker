"use client";

import React from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { cn } from "@job-tracker/ui";
import { useHasVerticalOverflow } from "@/modules/applications/shared/hooks/useHasVerticalOverflow";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
  parseTipTapDocument,
} from "@/modules/applications/shared/utils/tiptap";

interface TipTapEditorProps {
  id?: string;
  value: string | null | undefined;
  onChange: (nextValue: string) => void;
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
  id,
  value,
  onChange,
  placeholder = "Write...",
  disabled = false,
  fillHeight = false,
  contentClassName,
}: TipTapEditorProps) {
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
    onUpdate({ editor: nextEditor }) {
      onChange(JSON.stringify(nextEditor.getJSON()));
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  React.useEffect(() => {
    if (!editor) return;
    const incoming = normalizeTipTapDocument(value);
    const current = JSON.stringify(editor.getJSON());
    if (incoming !== current) {
      editor.commands.setContent(parseTipTapDocument(value), {
        emitUpdate: false,
      });
    }
  }, [editor, value]);
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
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        />
        <ToolbarButton
          label="Clear"
          onClick={() => {
            editor.chain().focus().clearNodes().unsetAllMarks().run();
            editor.commands.setContent(parseTipTapDocument(EMPTY_TIPTAP_DOC));
            onChange(EMPTY_TIPTAP_DOC);
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
