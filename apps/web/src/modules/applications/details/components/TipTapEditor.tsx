"use client";

import {
  normalizeTipTapDocument,
  parseTipTapDocument,
  tipTapToPlainText,
} from "@job-tracker/tiptap";
import {
  cn,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuItem,
  Tooltip,
} from "@job-tracker/ui";
import {
  ArrowsOutSimpleIcon,
  BroomIcon,
  CaretDownIcon,
  CheckIcon,
  CircleNotchIcon,
  ListBulletsIcon,
  MicrophoneIcon,
  PencilSimpleIcon,
  SparkleIcon,
  TextBolderIcon,
  TextHOneIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextTIcon,
  UploadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import Placeholder from "@tiptap/extension-placeholder";
import { Slice } from "@tiptap/pm/model";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

import type { PdfExportConfig } from "@/lib/pdf-export-config";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";
import {
  isInHeading,
  transformPastedHeadingBold,
} from "@/modules/applications/details/components/no-bold-in-headings";
import { SaveAsPdfButton } from "@/modules/applications/details/components/SaveAsPdfButton";
import { ToolbarButton } from "@/modules/applications/details/components/ToolbarButton";
import { useFileImport } from "@/modules/applications/details/hooks/useFileImport";
import {
  type TipTapEditorHandle,
  useTipTapEditorHandle,
} from "@/modules/applications/details/hooks/useTipTapEditorHandle";
import { useVoiceToText } from "@/modules/applications/details/hooks/useVoiceToText";
import { useHasVerticalOverflow } from "@/modules/applications/shared/hooks/useHasVerticalOverflow";

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
  aiActions?: TipTapAiAction[];
  onExpandClick?: () => void;
  showExpandButton?: boolean;
  expandButtonAriaLabel?: string;
  expandButtonDisabled?: boolean;
  enableVoiceToText?: boolean;
  voiceToTextLanguage?: string;
  enableImport?: boolean;
  pdfExportConfig?: PdfExportConfig;
}

function AiSuggestionSegmentedControl({
  aiGenerationLoading,
  actions,
  isActionDisabled,
  isApproveDisabled,
  isRejectDisabled,
  onActionSelect,
  onApprove,
  onReject,
}: {
  aiGenerationLoading: boolean;
  actions: TipTapAiAction[];
  isActionDisabled: (action: TipTapAiAction) => boolean;
  isApproveDisabled: boolean;
  isRejectDisabled: boolean;
  onActionSelect: (action: TipTapAiAction) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded border border-border-subtle",
      )}
    >
      <DropdownMenu
        align="start"
        trigger={
          <div>
            <ToolbarButton
              label={
                aiGenerationLoading ? (
                  <span className={cn("inline-flex items-center gap-1")}>
                    <CircleNotchIcon
                      size={12}
                      weight="bold"
                      className={cn("animate-spin")}
                    />
                    {"AI..."}
                    <CaretDownIcon size={12} weight="bold" />
                  </span>
                ) : (
                  <span className={cn("inline-flex items-center gap-1")}>
                    <SparkleIcon size={12} weight="fill" />
                    AI
                    <CaretDownIcon size={12} weight="bold" />
                  </span>
                )
              }
              ariaLabel="Open AI actions"
              disabled={actions.every((action) => isActionDisabled(action))}
              className={cn("rounded-none border-0")}
            />
          </div>
        }
      >
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            icon={
              action.kind === "rewrite" ? (
                <PencilSimpleIcon size={14} weight="bold" />
              ) : (
                <SparkleIcon size={14} weight="fill" />
              )
            }
            onSelect={() => onActionSelect(action)}
            disabled={isActionDisabled(action)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
      {!isApproveDisabled ? (
        <ToolbarButton
          label={<CheckIcon size={14} weight="bold" />}
          ariaLabel="Approve AI suggestion"
          onClick={onApprove}
          disabled={isApproveDisabled}
          className={cn(
            "rounded-none border-0 border-l border-border-subtle text-text-success",
          )}
        />
      ) : null}
      {!isRejectDisabled ? (
        <ToolbarButton
          label={<XIcon size={14} weight="bold" />}
          ariaLabel="Reject AI suggestion"
          onClick={onReject}
          disabled={isRejectDisabled}
          className={cn(
            "rounded-none border-0 border-l border-border-subtle text-text-error",
          )}
        />
      ) : null}
    </div>
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
    "[&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h1]:text-lg/tight [&_.ProseMirror_h1]:font-semibold ",
    "[&_.ProseMirror_h2]:my-2 [&_.ProseMirror_h2]:text-lg/tight [&_.ProseMirror_h2]:font-medium ",
    "[&_.ProseMirror_h3]:my-2 [&_.ProseMirror_h3]:text-lg/tight [&_.ProseMirror_h3]:font-normal ",
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
  aiActions,
  onExpandClick,
  showExpandButton = false,
  expandButtonAriaLabel = "Expand editor",
  expandButtonDisabled,
  enableVoiceToText = true,
  voiceToTextLanguage = "en-US",
  enableImport = false,
  pdfExportConfig,
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
      StarterKit.configure({ codeBlock: false, horizontalRule: false }),
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
        if ((event.ctrlKey || event.metaKey) && event.key === "b") {
          if (isInHeading(editor)) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      transformPasted(slice): Slice {
        return transformPastedHeadingBold(slice, editor);
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

  const { clearDocument } = useTipTapEditorHandle({ ref, editor, onChange });

  const {
    fileInputRef,
    isImporting,
    showImportConfirm,
    setShowImportConfirm,
    handleImportFile,
    handleImportClick,
    handleConfirmImport,
  } = useFileImport({ editor, onChange });

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
  const {
    isListening: isListeningVoiceToText,
    isSupported: voiceToTextSupported,
    toggle: toggleVoiceToText,
  } = useVoiceToText({
    enabled: enableVoiceToText,
    disabled,
    language: voiceToTextLanguage,
    getCurrentText: () =>
      editor ? tipTapToPlainText(JSON.stringify(editor.getJSON())).trim() : "",
    onTranscriptChange: (nextText) => {
      if (!editor) return;
      const normalizedValue = normalizeTipTapDocument(nextText);
      editor.commands.setContent(parseTipTapDocument(normalizedValue), {
        emitUpdate: false,
      });
      onChange(normalizedValue);
    },
  });

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

  const aiGenerationLoading = Boolean(
    isGeneratingAiLocally ||
    aiActions?.some((action) => Boolean(action.isLoading)),
  );

  async function handleAiAction(action: TipTapAiAction) {
    if (!editor || aiGenerationLoading || action.disabled) {
      return;
    }

    const currentValue = JSON.stringify(editor.getJSON());
    const documentText = tipTapToPlainText(currentValue).trim();
    setIsGeneratingAiLocally(true);
    try {
      if (action.kind === "rewrite") {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc
          .textBetween(from, to, "\n\n")
          .trim();
        const hasSelection = from !== to && selectedText.length > 0;
        const sourceText = hasSelection ? selectedText : documentText;
        if (!sourceText.trim()) {
          return;
        }

        const rewrittenValue = await action.run({ sourceText, documentText });
        if (rewrittenValue == null) {
          return;
        }

        const rewrittenText = rewrittenValue.trim();
        if (!rewrittenText) {
          return;
        }

        setPendingAiOriginalContent(currentValue);
        if (hasSelection) {
          editor
            .chain()
            .focus()
            .insertContentAt({ from, to }, rewrittenText)
            .run();
        } else {
          const normalizedValue = normalizeTipTapDocument(rewrittenText);
          editor.commands.setContent(parseTipTapDocument(normalizedValue), {
            emitUpdate: false,
          });
          onChange(normalizedValue);
        }
        return;
      }

      const nextValue = await action.run({
        sourceText: documentText,
        documentText,
      });
      if (nextValue == null) {
        return;
      }
      const normalizedValue = normalizeTipTapDocument(nextValue);
      setPendingAiOriginalContent(currentValue);
      editor.commands.setContent(parseTipTapDocument(normalizedValue), {
        emitUpdate: false,
      });
      onChange(normalizedValue);
    } catch {
      action.onError?.();
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
            disabled={disabled || hasActiveHeading}
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
              <div>
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
              </div>
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
          <SaveAsPdfButton
            editor={editor}
            disabled={disabled}
            pdfExportConfig={pdfExportConfig}
          />
          {enableImport ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.html,.json,.pdf"
                className={cn("hidden")}
                onChange={handleImportFile}
                aria-hidden
              />
              <ToolbarButton
                label={<UploadSimpleIcon size={14} weight="bold" />}
                ariaLabel="Import from file"
                onClick={handleImportClick}
                disabled={disabled}
                loading={isImporting}
              />
              <ConfirmDialog
                open={showImportConfirm}
                onOpenChange={setShowImportConfirm}
                title="Import file"
                description="Importing will replace the current editor content. Continue?"
                confirmLabel="Import"
                confirmIntent="primary"
                onConfirm={handleConfirmImport}
              />
            </>
          ) : null}
          {enableVoiceToText ? (
            <ToolbarButton
              label={
                isListeningVoiceToText ? (
                  <MicrophoneIcon
                    size={14}
                    weight="fill"
                    className={cn("text-text-error")}
                  />
                ) : (
                  <MicrophoneIcon size={14} weight="bold" />
                )
              }
              ariaLabel={
                isListeningVoiceToText
                  ? "Stop voice to text"
                  : "Start voice to text"
              }
              onClick={toggleVoiceToText}
              disabled={disabled || !voiceToTextSupported}
            />
          ) : null}
          {aiActions && aiActions.length > 0 ? (
            <AiSuggestionSegmentedControl
              aiGenerationLoading={aiGenerationLoading}
              actions={aiActions}
              isActionDisabled={(action) => {
                if (disabled || action.disabled || action.isLoading) {
                  return true;
                }
                if (action.requiresSourceText || action.kind === "rewrite") {
                  const selectedText = editor.state.doc
                    .textBetween(
                      editor.state.selection.from,
                      editor.state.selection.to,
                      "\n\n",
                    )
                    .trim();
                  const documentText = tipTapToPlainText(
                    JSON.stringify(editor.getJSON()),
                  ).trim();
                  return !selectedText && !documentText;
                }
                return false;
              }}
              isApproveDisabled={disabled || pendingAiOriginalContent === null}
              isRejectDisabled={disabled || pendingAiOriginalContent === null}
              onActionSelect={(action) => void handleAiAction(action)}
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
