import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBreakpoint } from "./useBreakpoint";

function makeMatchMedia(initialMatches: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: initialMatches,
    addEventListener: vi.fn((_: string, fn: () => void) => {
      listeners.add(fn);
    }),
    removeEventListener: vi.fn((_: string, fn: () => void) => {
      listeners.delete(fn);
    }),
    trigger(newMatches: boolean) {
      mq.matches = newMatches;
      listeners.forEach((fn) => fn());
    },
  };
  return mq;
}

describe("useBreakpoint", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn(),
    });
  });

  it("returns false when query does not match", () => {
    const mq = makeMatchMedia(false);
    vi.mocked(window.matchMedia).mockReturnValue(
      mq as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useBreakpoint("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("returns true when query matches on mount", () => {
    const mq = makeMatchMedia(true);
    vi.mocked(window.matchMedia).mockReturnValue(
      mq as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useBreakpoint("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("updates state when media query fires a change event", () => {
    const mq = makeMatchMedia(false);
    vi.mocked(window.matchMedia).mockReturnValue(
      mq as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useBreakpoint("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      mq.trigger(true);
    });

    expect(result.current).toBe(true);
  });

  it("removes the event listener on unmount", () => {
    const mq = makeMatchMedia(false);
    vi.mocked(window.matchMedia).mockReturnValue(
      mq as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => useBreakpoint("(min-width: 768px)"));
    unmount();

    expect(mq.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
