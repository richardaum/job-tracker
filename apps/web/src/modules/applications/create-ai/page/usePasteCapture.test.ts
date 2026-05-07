import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePasteCapture } from "./usePasteCapture";

function dispatchPaste({
  textPlain,
  textHtml,
}: {
  textPlain?: string;
  textHtml?: string;
}) {
  const event = new Event("paste") as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", {
    configurable: true,
    value: {
      getData: (type: string) => {
        if (type === "text/plain") return textPlain ?? "";
        if (type === "text/html") return textHtml ?? "";
        return "";
      },
    },
  });
  window.dispatchEvent(event);
}

describe("usePasteCapture", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(document, "hasFocus").mockReturnValue(true);
  });

  it("calls onDuplicatePaste and keeps list unchanged", () => {
    const onDuplicatePaste = vi.fn();

    const { result } = renderHook(() =>
      usePasteCapture({
        onDuplicatePaste,
        deps: { now: () => 1000, uuid: () => "id-1" },
      }),
    );

    act(() => {
      dispatchPaste({ textPlain: "same text" });
      dispatchPaste({ textPlain: " same text " });
    });

    expect(result.current.pastes).toHaveLength(1);
    expect(result.current.pastes[0]?.text).toBe("same text");
    expect(onDuplicatePaste).toHaveBeenCalledTimes(1);
  });

  it("captures html payload while keeping plain text preview", () => {
    const { result } = renderHook(() =>
      usePasteCapture({ deps: { now: () => 1000, uuid: () => "id-1" } }),
    );

    act(() => {
      dispatchPaste({
        textPlain: "Senior Frontend Engineer",
        textHtml: "<p><strong>Senior</strong> Frontend Engineer</p>",
      });
    });

    expect(result.current.pastes).toHaveLength(1);
    expect(result.current.pastes[0]?.text).toBe("Senior Frontend Engineer");
    expect(result.current.pastes[0]?.html).toBe(
      "<p><strong>Senior</strong> Frontend Engineer</p>",
    );
  });

  it("does not capture paste events when disabled", () => {
    const { result } = renderHook(() =>
      usePasteCapture({
        enabled: false,
        deps: { now: () => 1000, uuid: () => "id-1" },
      }),
    );

    act(() => {
      dispatchPaste({ textPlain: "should not capture" });
    });

    expect(result.current.pastes).toHaveLength(0);
    expect(result.current.isPageFocused).toBe(false);
  });
});
