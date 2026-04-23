"use client";

import { useCallback, useEffect, useRef } from "react";

type UseNotesComposerBehaviorOptions = {
  hasLoadedMessages: boolean;
  notesCount: number;
};

export function useNotesComposerBehavior({
  hasLoadedMessages,
  notesCount,
}: UseNotesComposerBehaviorOptions) {
  const notesEndRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledInitiallyRef = useRef(false);
  const previousNotesCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    notesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (!hasLoadedMessages) return;
    if (!hasScrolledInitiallyRef.current) {
      scrollToBottom("auto");
      hasScrolledInitiallyRef.current = true;
      previousNotesCountRef.current = notesCount;
      return;
    }

    if (notesCount > previousNotesCountRef.current) {
      scrollToBottom("smooth");
    }

    previousNotesCountRef.current = notesCount;
  }, [hasLoadedMessages, notesCount, scrollToBottom]);

  const handleNoteSent = useCallback(() => {
    // Scroll is handled when notesCount updates.
  }, []);

  return {
    notesEndRef,
    handleNoteSent,
  };
}
