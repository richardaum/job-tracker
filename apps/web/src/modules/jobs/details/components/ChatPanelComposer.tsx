"use client";

import { Button, cn } from "@job-tracker/ui";
import { type Ref, useImperativeHandle, useRef } from "react";

type ChatPanelComposerProps = {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  ref?: Ref<ChatPanelComposerHandle>;
};

export type ChatPanelComposerHandle = {
  focus: () => void;
  clear: () => void;
};

function ChatPanelComposerInner({ onSend, disabled = false, placeholder = "Ask anything about this job...", ref }: ChatPanelComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const content = textarea.value.trim();
    if (!content || disabled) return;
    onSend(content);
    textarea.value = "";
    textarea.style.height = "auto";
  }

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    clear: () => {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
    },
  }), []);

  function handleInput() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  return (
    <div className={cn("flex items-end gap-2 border-t border-border-subtle p-3")}>
      <textarea
        ref={textareaRef}
        className={cn(
          "min-h-[36px] max-h-32 flex-1 resize-none rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-text-muted/50 focus:border-border-focus focus:ring-1 focus:ring-border-focus",
        )}
        placeholder={placeholder}
        rows={1}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
      />
      <Button
        size="md"
        intent="primary"
        onClick={handleSend}
        disabled={disabled}
        className={cn("shrink-0")}
      >
        Send
      </Button>
    </div>
  );
}

export const ChatPanelComposer = ChatPanelComposerInner;
