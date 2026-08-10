import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastQueueProvider } from "./ToastQueueProvider";
import { useToastQueue } from "./useToastQueue";

vi.mock("@/lib/generate-uuid", () => ({ generateUuid: vi.fn() }));

import { generateUuid } from "@/lib/generate-uuid";

describe("useToastQueue", () => {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ToastQueueProvider, null, children);
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enqueues toast with generated id and intent", () => {
    vi.mocked(generateUuid).mockReturnValue("toast-1");

    const { result } = renderHook(() => useToastQueue(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({ title: "Saved.", intent: "success" });
    });

    expect(result.current.toastProps.toasts).toEqual([
      { id: "toast-1", title: "Saved.", intent: "success", description: undefined },
    ]);
  });

  it("dismisses closed toast", () => {
    vi.mocked(generateUuid).mockReturnValueOnce("toast-1").mockReturnValueOnce("toast-2");

    const { result } = renderHook(() => useToastQueue(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({ title: "One" });
      result.current.enqueueToast({ title: "Two" });
      result.current.dismissToast("toast-1");
    });

    expect(result.current.toastProps.toasts).toEqual([
      { id: "toast-2", title: "Two", intent: "info", description: undefined },
    ]);
  });

  it("keeps manual lifetime as toast queue metadata", () => {
    vi.mocked(generateUuid).mockReturnValue("toast-1");

    const { result } = renderHook(() => useToastQueue(), { wrapper: Wrapper });

    act(() => {
      result.current.enqueueToast({ title: "Created.", lifetime: "manual" });
    });

    expect(result.current.toastProps.toasts).toContainEqual(
      expect.objectContaining({ id: "toast-1", lifetime: "manual" }),
    );
  });
});
