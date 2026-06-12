"use client";

import { useCallback, useRef, useState } from "react";

import { AiMessageRole } from "@/gql/hooks";

export interface PendingChatMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export interface PendingChatMessages {
  mergeWithServer: (serverMessages: PendingChatMessage[]) => PendingChatMessage[];
  add: (content: string) => string;
  remove: (id: string) => void;
  clear: () => void;
  currentIdRef: React.RefObject<string | null>;
  setCurrentId: (id: string | null) => void;
}

function createPendingId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Optimistic user messages shown until the server confirms them. */
export function usePendingChatMessages(): PendingChatMessages {
  const [pendingMessages, setPendingMessages] = useState<PendingChatMessage[]>([]);
  const currentIdRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    setPendingMessages([]);
    currentIdRef.current = null;
  }, []);

  const setCurrentId = useCallback((id: string | null) => {
    currentIdRef.current = id;
  }, []);

  const remove = useCallback((id: string) => {
    setPendingMessages((prev) => prev.filter((m) => m.id !== id));
    if (currentIdRef.current === id) currentIdRef.current = null;
  }, []);

  const add = useCallback((content: string): string => {
    const tempId = createPendingId();
    setPendingMessages((prev) => [
      ...prev,
      { id: tempId, role: AiMessageRole.User, content, createdAt: new Date().toISOString() },
    ]);
    return tempId;
  }, []);

  const mergeWithServer = useCallback(
    (serverMessages: PendingChatMessage[]): PendingChatMessage[] => {
      if (pendingMessages.length === 0) return serverMessages;
      const pendingIds = new Set(pendingMessages.map((m) => m.id));
      const dedupedServer = serverMessages.filter((m) => !pendingIds.has(m.id));
      return [...dedupedServer, ...pendingMessages];
    },
    [pendingMessages],
  );

  return { mergeWithServer, add, remove, clear, currentIdRef, setCurrentId };
}
