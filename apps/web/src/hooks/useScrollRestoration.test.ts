import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollRestoration } from "./useScrollRestoration";

const storageKey = "scroll-restoration:jobs";

function createContainer({ scrollTop = 0, scrollHeight = 1000, clientHeight = 300 } = {}) {
  const container = document.createElement("div");
  Object.defineProperties(container, {
    clientHeight: { configurable: true, value: clientHeight },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: { configurable: true, value: scrollTop, writable: true },
  });
  return container;
}

describe("useScrollRestoration", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores a saved position once the list is ready", () => {
    const container = createContainer();
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    const containerRef = createRef<HTMLDivElement>();
    containerRef.current = container;
    sessionStorage.setItem(storageKey, JSON.stringify({ top: 240 }));

    renderHook(() => useScrollRestoration({ key: "jobs", containerRef, ready: true }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 240 });
    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });

  it("persists the current scroll position during cleanup", () => {
    const container = createContainer({ scrollTop: 180 });
    const containerRef = createRef<HTMLDivElement>();
    containerRef.current = container;

    const { unmount } = renderHook(() => useScrollRestoration({ key: "jobs", containerRef }));
    unmount();

    expect(sessionStorage.getItem(storageKey)).toBe(JSON.stringify({ top: 180 }));
  });

  it("persists scroll events on the next animation frame", () => {
    const container = createContainer({ scrollTop: 180 });
    const containerRef = createRef<HTMLDivElement>();
    containerRef.current = container;
    const addEventListener = vi.spyOn(container, "addEventListener");
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    renderHook(() => useScrollRestoration({ key: "jobs", containerRef }));
    const scrollHandler = addEventListener.mock.calls.find(([event]) => event === "scroll")?.[1];

    act(() => {
      (scrollHandler as EventListener)(new Event("scroll"));
    });

    expect(sessionStorage.getItem(storageKey)).toBe(JSON.stringify({ top: 180 }));
  });

  it("does nothing when disabled or when no valid snapshot exists", () => {
    const container = createContainer();
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    const containerRef = createRef<HTMLDivElement>();
    containerRef.current = container;
    sessionStorage.setItem(storageKey, "not-json");

    const { unmount } = renderHook(() => useScrollRestoration({ key: "jobs", containerRef, enabled: false }));
    unmount();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(storageKey)).toBe("not-json");
  });
});
