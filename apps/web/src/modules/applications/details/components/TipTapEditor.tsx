"use client";

import { SegmentedToolbarControl } from "@/modules/applications/details/components/SegmentedToolbarControl";
import { ToolbarButton } from "@/modules/applications/details/components/ToolbarButton";
import {
  useTipTapEditorHandle,
  type TipTapEditorHandle,
} from "@/modules/applications/details/hooks/useTipTapEditorHandle";
import { useHasVerticalOverflow } from "@/modules/applications/shared/hooks/useHasVerticalOverflow";
import {
  normalizeTipTapDocument,
  parseTipTapDocument,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";
import { DropdownMenu, DropdownMenuItem, Tooltip, cn } from "@job-tracker/ui";
import {
  ArrowsOutSimpleIcon,
  BroomIcon,
  CaretDownIcon,
  CheckIcon,
  CircleNotchIcon,
  ListBulletsIcon,
  SparkleIcon,
  TextBolderIcon,
  TextHOneIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextTIcon,
  XIcon,
} from "@phosphor-icons/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

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
  autofocus?: boolean | "start" | "end" | "all" | number | null;
  contentClassName?: string;
  aiContentGeneration?: {
    onGenerateContent: () => Promise<string | null | undefined>;
    isGenerating?: boolean;
    disabled?: boolean;
    buttonLabel?: string;
    onError?: () => void;
  };
  onExpandClick?: () => void;
  showExpandButton?: boolean;
  expandButtonAriaLabel?: string;
  expandButtonDisabled?: boolean;
}

function AiSuggestionSegmentedControl({
  aiGenerationLoading,
  aiButtonLabel,
  isGenerateDisabled,
  isApproveDisabled,
  isRejectDisabled,
  onGenerate,
  onApprove,
  onReject,
}: {
  aiGenerationLoading: boolean;
  aiButtonLabel?: string;
  isGenerateDisabled: boolean;
  isApproveDisabled: boolean;
  isRejectDisabled: boolean;
  onGenerate: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <SegmentedToolbarControl>
      <ToolbarButton
        label={
          aiGenerationLoading ? (
            <span className={cn("inline-flex items-center gap-1")}>
              <CircleNotchIcon
                size={12}
                weight="bold"
                className={cn("animate-spin")}
              />
              {(aiButtonLabel ?? "AI") + "..."}
            </span>
          ) : (
            <span className={cn("inline-flex items-center gap-1")}>
              <SparkleIcon size={12} weight="fill" />
              {aiButtonLabel ?? "AI"}
            </span>
          )
        }
        ariaLabel="Generate AI suggestion"
        onClick={onGenerate}
        disabled={isGenerateDisabled}
      />
      {!isApproveDisabled ? (
        <ToolbarButton
          label={<CheckIcon size={14} weight="bold" />}
          ariaLabel="Approve AI suggestion"
          onClick={onApprove}
          disabled={isApproveDisabled}
          className="text-text-success"
        />
      ) : null}
      {!isRejectDisabled ? (
        <ToolbarButton
          label={<XIcon size={14} weight="bold" />}
          ariaLabel="Reject AI suggestion"
          onClick={onReject}
          disabled={isRejectDisabled}
          className="text-text-error"
        />
      ) : null}
    </SegmentedToolbarControl>
  );
}

const editorContentClasses = {
  container: cn("min-h-24 rounded-b-md border border-border-subtle border-t-0"),
  proseMirrorBase: cn(
    "[&_.ProseMirror]:min-h-20 [&_.ProseMirror]:p-3 [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:wrap-break-word",
    "[&_.ProseMirror_p]:m-0 [&_.ProseMirror_p+p]:mt-2",
  ),
  bulletList: cn(
    "[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5",
  ),
  orderedList: cn(
    "[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5",
  ),
  heading: cn(
    "[&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h1]:text-lg [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:leading-tight",
    "[&_.ProseMirror_h2]:my-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-medium [&_.ProseMirror_h2]:leading-tight",
    "[&_.ProseMirror_h3]:my-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-normal [&_.ProseMirror_h3]:leading-tight",
  ),
  link: cn("[&_.ProseMirror_a]:text-text-brand [&_.ProseMirror_a]:underline"),
  placeholder: cn(
    "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-text-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
    "[&_.ProseMirror_h1.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_h1.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_h1.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h1.is-editor-empty:first-child::before]:text-text-muted [&_.ProseMirror_h1.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
    "[&_.ProseMirror_h2.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_h2.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_h2.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h2.is-editor-empty:first-child::before]:text-text-muted [&_.ProseMirror_h2.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
    "[&_.ProseMirror_h3.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_h3.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_h3.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h3.is-editor-empty:first-child::before]:text-text-muted [&_.ProseMirror_h3.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
  ),
  overflowHidden: cn("border-r-0"),
  fillHeight: cn(
    "flex-1 min-h-0 overflow-hidden",
    "[&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:overflow-y-auto",
  ),
};

export function TipTapEditor({
  ref,
  id,
  value,
  onChange,
  onHardEnter,
  placeholder = "Write...",
  disabled = false,
  fillHeight = false,
  autofocus = false,
  contentClassName,
  aiContentGeneration,
  onExpandClick,
  showExpandButton = false,
  expandButtonAriaLabel = "Expand editor",
  expandButtonDisabled,
}: TipTapEditorProps) {
  const onHardEnterRef = React.useRef(onHardEnter);
  const [isGeneratingAiLocally, setIsGeneratingAiLocally] =
    React.useState(false);
  const [pendingAiOriginalContent, setPendingAiOriginalContent] =
    React.useState<string | null>(null);
  React.useLayoutEffect(() => {
    onHardEnterRef.current = onHardEnter;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: parseTipTapDocument(value),
    autofocus,
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
      isHeadingLevel1: e?.isActive("heading", { level: 1 }),
      isHeadingLevel2: e?.isActive("heading", { level: 2 }),
      isHeadingLevel3: e?.isActive("heading", { level: 3 }),
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

  const aiGenerationLoading =
    Boolean(aiContentGeneration?.isGenerating) || isGeneratingAiLocally;
  const activeBlockAriaLabel = editorState?.isHeadingLevel1
    ? "Heading 1"
    : editorState?.isHeadingLevel2
      ? "Heading 2"
      : editorState?.isHeadingLevel3
        ? "Heading 3"
        : "Paragraph";
  const hasActiveHeading = Boolean(
    editorState?.isHeadingLevel1 ||
    editorState?.isHeadingLevel2 ||
    editorState?.isHeadingLevel3,
  );

  async function handleGenerateAiContent() {
    if (!editor || !aiContentGeneration || aiGenerationLoading) {
      return;
    }

    setIsGeneratingAiLocally(true);
    try {
      const nextValue = await aiContentGeneration.onGenerateContent();
      if (nextValue == null) {
        return;
      }
      const normalizedValue = normalizeTipTapDocument(nextValue);
      const currentValue = JSON.stringify(editor.getJSON());
      setPendingAiOriginalContent(currentValue);
      editor.commands.setContent(parseTipTapDocument(normalizedValue), {
        emitUpdate: false,
      });
      onChange(normalizedValue);
    } catch {
      aiContentGeneration.onError?.();
    } finally {
      setIsGeneratingAiLocally(false);
    }
  }

  function handleApproveAiContent() {
    if (!pendingAiOriginalContent) {
      return;
    }
    setPendingAiOriginalContent(null);
  }

  function handleRejectAiContent() {
    if (!editor || !pendingAiOriginalContent) {
      return;
    }
    editor.commands.setContent(parseTipTapDocument(pendingAiOriginalContent), {
      emitUpdate: false,
    });
    onChange(pendingAiOriginalContent);
    setPendingAiOriginalContent(null);
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
          "flex items-start justify-between gap-2 rounded-t-md border border-border-subtle p-2",
        )}
      >
        <div className={cn("flex flex-1 flex-wrap gap-1")}>
          <ToolbarButton
            label={<TextBolderIcon size={14} weight="bold" />}
            ariaLabel="Bold"
            active={editorState?.isBold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          />
          <ToolbarButton
            label={<TextItalicIcon size={14} weight="bold" />}
            ariaLabel="Italic"
            active={editorState?.isItalic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          />
          <DropdownMenu
            trigger={
              <Tooltip content={`Text style: ${activeBlockAriaLabel}`}>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Text style: ${activeBlockAriaLabel}`}
                  className={cn(
                    "inline-flex items-center justify-center gap-1 rounded border px-2 py-1 text-xs transition-colors",
                    hasActiveHeading
                      ? "border-border-brand bg-bg-brand-subtle text-text-brand"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-surface-hover",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {editorState?.isHeadingLevel1 ? (
                    <TextHOneIcon size={14} weight="bold" />
                  ) : editorState?.isHeadingLevel2 ? (
                    <TextHTwoIcon size={14} weight="bold" />
                  ) : editorState?.isHeadingLevel3 ? (
                    <TextHThreeIcon size={14} weight="bold" />
                  ) : (
                    <TextTIcon size={14} weight="bold" />
                  )}
                  <CaretDownIcon size={12} weight="bold" />
                </button>
              </Tooltip>
            }
            align="start"
          >
            <DropdownMenuItem
              icon={<TextTIcon size={14} weight="bold" />}
              onSelect={() => editor.chain().focus().setParagraph().run()}
            >
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<TextHOneIcon size={14} weight="bold" />}
              onSelect={() =>
                editor.chain().focus().setHeading({ level: 1 }).run()
              }
            >
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<TextHTwoIcon size={14} weight="bold" />}
              onSelect={() =>
                editor.chain().focus().setHeading({ level: 2 }).run()
              }
            >
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<TextHThreeIcon size={14} weight="bold" />}
              onSelect={() =>
                editor.chain().focus().setHeading({ level: 3 }).run()
              }
            >
              Heading 3
            </DropdownMenuItem>
          </DropdownMenu>
          <ToolbarButton
            label={<ListBulletsIcon size={14} weight="bold" />}
            ariaLabel="Bullet list"
            active={editorState?.isBulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          />
          <ToolbarButton
            label={<BroomIcon size={14} weight="bold" />}
            ariaLabel="Clear formatting and content"
            onClick={() => {
              clearDocument(true);
            }}
            disabled={disabled}
          />
          {aiContentGeneration ? (
            <AiSuggestionSegmentedControl
              aiGenerationLoading={aiGenerationLoading}
              aiButtonLabel={aiContentGeneration.buttonLabel}
              isGenerateDisabled={
                disabled ||
                aiContentGeneration.disabled ||
                Boolean(aiContentGeneration.isGenerating)
              }
              isApproveDisabled={disabled || pendingAiOriginalContent === null}
              isRejectDisabled={disabled || pendingAiOriginalContent === null}
              onGenerate={() => void handleGenerateAiContent()}
              onApprove={handleApproveAiContent}
              onReject={handleRejectAiContent}
            />
          ) : null}
        </div>
        {showExpandButton ? (
          <ToolbarButton
            label={<ArrowsOutSimpleIcon size={14} weight="bold" />}
            ariaLabel={expandButtonAriaLabel}
            onClick={() => onExpandClick?.()}
            disabled={Boolean(disabled || expandButtonDisabled)}
            className={cn("ml-auto")}
          />
        ) : null}
      </div>
      <EditorContent
        editor={editor}
        id={id}
        className={cn(
          editorContentClasses.container,
          editorContentClasses.proseMirrorBase,
          editorContentClasses.bulletList,
          editorContentClasses.orderedList,
          editorContentClasses.heading,
          editorContentClasses.link,
          editorContentClasses.placeholder,
          hasVerticalOverflow && editorContentClasses.overflowHidden,
          fillHeight && editorContentClasses.fillHeight,
          contentClassName,
        )}
      />
    </div>
  );
}
