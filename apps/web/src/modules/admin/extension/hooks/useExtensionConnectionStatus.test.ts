import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import {
  EXTENSION_BRIDGE_MESSAGE_TYPE,
  EXTENSION_BRIDGE_PROBE_TIMEOUT_MS,
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
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PROBE_TIMEOUT_MS);
    });

    expect(result.current.status).toBe("disconnected");
    expect(result.current.authStatus).toBeNull();
  });

  it("sends only one ping on mount", () => {
    const postMessage = vi.spyOn(window, "postMessage");
    renderHook(() => useExtensionConnectionStatus());

    expect(postMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PROBE_TIMEOUT_MS * 3);
    });

    expect(postMessage).toHaveBeenCalledTimes(1);
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
            authStatus: "authenticated",
            authenticatedEmail: "user@example.com",
          },
        }),
      );
    });

    expect(result.current.status).toBe("connected");
    expect(result.current.extensionVersion).toBe("0.0.3");
    expect(result.current.authStatus).toBe("authenticated");
    expect(result.current.authenticatedEmail).toBe("user@example.com");
  });

  it("stays connected without sending additional pings", () => {
    const postMessage = vi.spyOn(window, "postMessage");
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
            authStatus: "authenticated",
            authenticatedEmail: "user@example.com",
          },
        }),
      );
    });

    expect(result.current.status).toBe("connected");
    const callsAfterConnect = postMessage.mock.calls.length;

    act(() => {
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PROBE_TIMEOUT_MS * 3);
    });

    expect(result.current.status).toBe("connected");
    expect(postMessage.mock.calls.length).toBe(callsAfterConnect);
  });

  it("retry resets to checking and sends a refresh-auth ping", () => {
    const postMessage = vi.spyOn(window, "postMessage");
    const { result } = renderHook(() => useExtensionConnectionStatus());

    act(() => {
      vi.advanceTimersByTime(EXTENSION_BRIDGE_PROBE_TIMEOUT_MS);
    });

    expect(result.current.status).toBe("disconnected");
    postMessage.mockClear();

    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe("checking");
    expect(result.current.authStatus).toBeNull();
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage.mock.calls[0]?.[0]).toMatchObject({ refreshAuth: true });
  });
});
