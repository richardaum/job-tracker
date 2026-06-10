import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiMessageRole } from "@/gql/hooks";

import { usePendingChatMessages } from "./usePendingChatMessages";

const SERVER_MESSAGES = [
  { id: "msg-1", role: AiMessageRole.User, content: "Saved", createdAt: "2024-01-01T00:00:00Z" },
];

describe("usePendingChatMessages", () => {
  it("add returns pending id and mergeWithServer includes it", () => {
    const { result } = renderHook(() => usePendingChatMessages());

    let pendingId = "";
    act(() => {
      pendingId = result.current.add("Hello");
    });

    expect(pendingId).toMatch(/^pending-/);

    const merged = result.current.mergeWithServer(SERVER_MESSAGES);
    expect(merged).toHaveLength(2);
    expect(merged[1].id).toBe(pendingId);
    expect(merged[1].content).toBe("Hello");
  });

  it("remove drops only the targeted pending message", () => {
    const { result } = renderHook(() => usePendingChatMessages());

    let firstId = "";
    let secondId = "";
    act(() => {
      firstId = result.current.add("First");
      secondId = result.current.add("Second");
    });

    act(() => {
      result.current.remove(secondId);
    });

    const merged = result.current.mergeWithServer([]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(firstId);
  });

  it("clear removes all pending messages", () => {
    const { result } = renderHook(() => usePendingChatMessages());

    act(() => {
      result.current.add("Hello");
      result.current.clear();
    });

    expect(result.current.mergeWithServer(SERVER_MESSAGES)).toEqual(SERVER_MESSAGES);
  });

  it("currentIdRef tracks the active pending id", () => {
    const { result } = renderHook(() => usePendingChatMessages());

    let pendingId = "";
    act(() => {
      pendingId = result.current.add("Hello");
      result.current.currentIdRef.current = pendingId;
    });

    expect(result.current.currentIdRef.current).toBe(pendingId);

    act(() => {
      result.current.remove(pendingId);
    });

    expect(result.current.currentIdRef.current).toBeNull();
  });
});
