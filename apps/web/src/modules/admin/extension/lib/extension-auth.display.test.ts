import { describe, expect, it } from "vitest";

import type { ExtensionConnectionState } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import { authDisplayLabel, authTextColor } from "@/modules/admin/extension/lib/extension-auth.display";

function authConnection(
  overrides: Pick<ExtensionConnectionState, "status" | "authStatus" | "authenticatedEmail">,
): ExtensionConnectionState {
  return {
    extensionVersion: null,
    browser: null,
    lastHeartbeatAt: null,
    webAppOrigin: "http://localhost:3100",
    ...overrides,
  };
}

describe("extension-auth.display", () => {
  it("shows unavailable when disconnected", () => {
    const connection = authConnection({ status: "disconnected", authStatus: null, authenticatedEmail: null });

    expect(authDisplayLabel(connection)).toBe("Unavailable");
    expect(authTextColor(connection)).toBe("muted");
  });

  it("shows email when authenticated", () => {
    const connection = authConnection({
      status: "connected",
      authStatus: "authenticated",
      authenticatedEmail: "user@example.com",
    });

    expect(authDisplayLabel(connection)).toBe("user@example.com");
    expect(authTextColor(connection)).toBeUndefined();
  });

  it("shows not signed in when connected but unauthenticated", () => {
    const connection = authConnection({ status: "connected", authStatus: "unauthenticated", authenticatedEmail: null });

    expect(authDisplayLabel(connection)).toBe("Not signed in");
    expect(authTextColor(connection)).toBe("warning");
  });
});
