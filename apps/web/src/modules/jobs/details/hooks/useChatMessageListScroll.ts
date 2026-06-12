"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type UseChatMessageListScrollOptions = {
  conversationId: string | null;
  messageCount: number;
  isStreaming: boolean;
  streamContent: string;
};

const NEAR_BOTTOM_THRESHOLD_PX = 100;

/** Keeps the message list scrolled to bottom when the user is near the bottom. */
export function useChatMessageListScroll({
  conversationId,
  messageCount,
  isStreaming,
  streamContent,
}: UseChatMessageListScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const trackedConversationIdRef = useRef<string | null>(null);
  const hasScrolledInitiallyRef = useRef(false);
  const previousMessageCountRef = useRef(0);
  const wasStreamingRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const el = scrollContainerRef.current;
    if (!el || !isNearBottomRef.current) return;

    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (conversationId === trackedConversationIdRef.current) return;

    trackedConversationIdRef.current = conversationId;
    hasScrolledInitiallyRef.current = false;
    previousMessageCountRef.current = 0;
    isNearBottomRef.current = true;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || hasScrolledInitiallyRef.current) return;

    scrollToBottom("auto");
    hasScrolledInitiallyRef.current = true;
    previousMessageCountRef.current = messageCount;
  }, [conversationId, messageCount, scrollToBottom]);

  useLayoutEffect(() => {
    if (!hasScrolledInitiallyRef.current) return;
    if (!wasStreamingRef.current || isStreaming) return;

    scrollToBottom("auto");
  }, [isStreaming, messageCount, scrollToBottom]);

  useEffect(() => {
    if (!hasScrolledInitiallyRef.current) return;
    if (messageCount <= previousMessageCountRef.current) return;

    const justFinishedStreaming = wasStreamingRef.current && !isStreaming;
    if (!justFinishedStreaming) {
      scrollToBottom("smooth");
    }

    previousMessageCountRef.current = messageCount;
  }, [messageCount, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (!isStreaming) return;

    scrollToBottom("auto");
  }, [isStreaming, streamContent, scrollToBottom]);

  useEffect(() => {
    wasStreamingRef.current = isStreaming;
  }, [isStreaming]);

  return { scrollContainerRef };
}
