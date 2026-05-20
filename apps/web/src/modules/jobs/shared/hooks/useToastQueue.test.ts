import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastQueueProvider } from "./ToastQueueProvider";
import { useToastQueue } from "./useToastQueue";

describe("useToastQueue", () => {
  function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(ToastQueueProvider, null, children);
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enqueues toast with generated id and intent", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("toast-1");

    const { result } = renderHook(() => useToastQueue(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({ title: "Saved.", intent: "success" });
    });

    expect(result.current.toastProps.toasts).toEqual([
      {
        id: "toast-1",
        title: "Saved.",
        intent: "success",
        description: undefined,
      },
    ]);
  });

  it("dismisses closed toast", () => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("toast-1")
      .mockReturnValueOnce("toast-2");

    const { result } = renderHook(() => useToastQueue(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({ title: "One" });
      result.current.enqueueToast({ title: "Two" });
      result.current.dismissToast("toast-1", false);
    });

    expect(result.current.toastProps.toasts).toEqual([
      { id: "toast-2", title: "Two", intent: "info", description: undefined },
    ]);
  });
});
