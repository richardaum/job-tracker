import { describe, expect, it } from "vitest";

import {
  createExtensionBridgePing,
  EXTENSION_BRIDGE_MESSAGE_TYPE,
  EXTENSION_BRIDGE_SOURCE,
  isExtensionBridgePing,
  isExtensionBridgePong,
} from "@/modules/admin/extension/lib/extension-bridge.protocol";

describe("extension-bridge.protocol", () => {
  it("creates and validates ping messages", () => {
    const ping = createExtensionBridgePing("req-1");

    expect(ping).toEqual({
      type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping,
      source: EXTENSION_BRIDGE_SOURCE,
      requestId: "req-1",
    });
    expect(isExtensionBridgePing(ping)).toBe(true);
    expect(isExtensionBridgePing({ ...ping, source: "other" })).toBe(false);
  });

  it("creates refresh auth pings", () => {
    const ping = createExtensionBridgePing("req-2", { refreshAuth: true });

    expect(ping.refreshAuth).toBe(true);
    expect(isExtensionBridgePing(ping)).toBe(true);
  });

  it("validates pong messages", () => {
    const pong = {
      type: EXTENSION_BRIDGE_MESSAGE_TYPE.pong,
      source: EXTENSION_BRIDGE_SOURCE,
      requestId: "req-1",
      extensionVersion: "0.0.3",
      browser: "Chrome",
      lastHeartbeatAt: new Date().toISOString(),
      webAppOrigin: "http://localhost:3100",
      authStatus: "authenticated",
      authenticatedEmail: "user@example.com",
    } as const;

    expect(isExtensionBridgePong(pong)).toBe(true);
    expect(isExtensionBridgePong({ ...pong, extensionVersion: 1 })).toBe(false);
    expect(isExtensionBridgePong({ ...pong, authStatus: "unknown" })).toBe(false);
  });
});
