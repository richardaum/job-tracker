import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerMessageListenerByKind } from "@/domains/message/runtime-message-listener";

describe("registerMessageListenerByKind", () => {
  let listener: (
    message: unknown,
    sender: unknown,
    sendResponse: (response?: unknown) => void,
  ) => boolean | undefined;

  beforeEach(() => {
    listener = vi.fn();
    vi.stubGlobal("chrome", {
      runtime: {
        onMessage: {
          addListener: vi.fn((cb) => {
            listener = cb;
          }),
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns sync handler responses via sendResponse", () => {
    const sendResponse = vi.fn();

    registerMessageListenerByKind({
      "admin.get-status": () => ({
        extensionVersion: "0.0.3",
        browser: "Chrome",
        lastHeartbeatAt: "2026-05-25T12:00:00.000Z",
        webAppOrigin: "http://localhost:3103",
      }),
    });

    listener({ kind: "admin.get-status", webAppOrigin: "http://localhost:3103" }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({
      extensionVersion: "0.0.3",
      browser: "Chrome",
      lastHeartbeatAt: "2026-05-25T12:00:00.000Z",
      webAppOrigin: "http://localhost:3103",
    });
  });
});
