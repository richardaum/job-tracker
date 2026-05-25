import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import {
  EXTENSION_BRIDGE_MESSAGE_TYPE,
  EXTENSION_BRIDGE_PING_INTERVAL_MS,
  EXTENSION_BRIDGE_SOURCE,
} from "@/modules/admin/extension/lib/extension-bridge.protocol";

describe("useExtensionConnectionStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in checking and becomes disconnected without a pong", () => {
    const { result } = renderHook(() => useExtensionConnectionStatus());

    expect(result.current.status).toBe("checking");

    act(() => {
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PING_INTERVAL_MS);
    });

    expect(result.current.status).toBe("disconnected");
  });

  it("becomes connected when a pong is received", () => {
    const { result } = renderHook(() => useExtensionConnectionStatus());

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: window,
          origin: window.location.origin,
          data: {
            type: EXTENSION_BRIDGE_MESSAGE_TYPE.pong,
            source: EXTENSION_BRIDGE_SOURCE,
            requestId: "req-1",
            extensionVersion: "0.0.3",
            browser: "Chrome",
            lastHeartbeatAt: "2026-05-25T12:00:00.000Z",
            webAppOrigin: window.location.origin,
          },
        }),
      );
    });

    expect(result.current.status).toBe("connected");
    expect(result.current.extensionVersion).toBe("0.0.3");
  });

  it("retry resets to checking and sends another ping", () => {
    const postMessage = vi.spyOn(window, "postMessage");
    const { result } = renderHook(() => useExtensionConnectionStatus());

    act(() => {
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PING_INTERVAL_MS);
    });

    expect(result.current.status).toBe("disconnected");
    postMessage.mockClear();

    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe("checking");
    expect(postMessage).toHaveBeenCalledTimes(1);
  });
});
