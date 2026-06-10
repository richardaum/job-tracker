import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({ searchParams: "", pathname: "/jobs/job-1/chat", replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

import { useChatConversationQueryParam } from "./useChatConversationQueryParam";

describe("useChatConversationQueryParam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.searchParams = "";
    navigationMocks.pathname = "/jobs/job-1/chat";
  });

  it("opens conversation from cid query param after conversations load", async () => {
    navigationMocks.searchParams = "w=full&cid=conv-1";
    const switchConversation = vi.fn();

    renderHook(() => useChatConversationQueryParam(null, [{ id: "conv-1" }], false, switchConversation));

    await waitFor(() => {
      expect(switchConversation).toHaveBeenCalledWith("conv-1");
    });
  });

  it("adds cid to the url when active conversation changes", async () => {
    const switchConversation = vi.fn();

    const { rerender } = renderHook(
      ({ conversationId }) =>
        useChatConversationQueryParam(conversationId, [{ id: "conv-1" }], false, switchConversation),
      { initialProps: { conversationId: null as string | null } },
    );

    rerender({ conversationId: "conv-1" });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/jobs/job-1/chat?cid=conv-1");
    });
  });

  it("preserves existing query params when syncing cid", async () => {
    navigationMocks.searchParams = "w=full";
    const switchConversation = vi.fn();

    const { rerender } = renderHook(
      ({ conversationId }) =>
        useChatConversationQueryParam(conversationId, [{ id: "conv-1" }], false, switchConversation),
      { initialProps: { conversationId: null as string | null } },
    );

    rerender({ conversationId: "conv-1" });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/jobs/job-1/chat?w=full&cid=conv-1");
    });
  });

  it("removes cid when conversation is cleared", async () => {
    navigationMocks.searchParams = "w=full&cid=conv-1";
    const switchConversation = vi.fn();

    const { rerender } = renderHook(
      ({ conversationId }) =>
        useChatConversationQueryParam(conversationId, [{ id: "conv-1" }], false, switchConversation),
      { initialProps: { conversationId: "conv-1" as string | null } },
    );

    rerender({ conversationId: null });

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/jobs/job-1/chat?w=full");
    });
  });
});
