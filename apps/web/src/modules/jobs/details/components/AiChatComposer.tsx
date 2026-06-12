"use client";

import { Button, cn, Input } from "@job-tracker/ui";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

type AiChatComposerProps = { onSend: (content: string) => void; disabled: boolean; isStreaming: boolean };

/** Message input with send on Enter or button click. */
export function AiChatComposer({ onSend, disabled, isStreaming }: AiChatComposerProps) {
  const [draft, setDraft] = useState("");

  const canSend = draft.trim().length > 0 && !disabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  }, [canSend, draft, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className={cn("flex items-center gap-2")}>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question..."
        disabled={disabled || isStreaming}
        size="md"
        className={cn("flex-1")}
      />
      <Button
        size="md"
        intent="primary"
        onClick={handleSend}
        disabled={!canSend}
        state={isStreaming ? "loading" : "default"}
        rightIcon={<PaperPlaneRightIcon size={14} weight="bold" />}
      >
        Send
      </Button>
    </div>
  );
}
