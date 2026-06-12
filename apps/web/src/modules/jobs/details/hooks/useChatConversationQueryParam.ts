"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/** Syncs active conversation with the `?cid=` query param. */
export function useChatConversationQueryParam(
  conversationId: string | null,
  conversations: Array<{ id: string }>,
  conversationsLoading: boolean,
  switchConversation: (id: string | null) => void,
): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydratedFromUrlRef = useRef(false);

  useEffect(() => {
    if (conversationsLoading || hydratedFromUrlRef.current) return;

    const cid = searchParams.get("cid")?.trim();
    if (cid && conversations.some((c) => c.id === cid)) {
      switchConversation(cid);
    }

    hydratedFromUrlRef.current = true;
  }, [conversations, conversationsLoading, searchParams, switchConversation]);

  useEffect(() => {
    if (!hydratedFromUrlRef.current) return;

    const currentCid = searchParams.get("cid");
    if (conversationId) {
      if (currentCid === conversationId) return;
      const next = new URLSearchParams(searchParams.toString());
      next.set("cid", conversationId);
      router.replace(`${pathname}?${next.toString()}` as Route);
      return;
    }

    if (!currentCid) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("cid");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}` as Route);
  }, [conversationId, pathname, router, searchParams]);
}
