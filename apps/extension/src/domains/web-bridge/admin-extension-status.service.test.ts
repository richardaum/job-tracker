import { describe, expect, it, vi } from "vitest";

import { AdminExtensionStatusService } from "@/domains/web-bridge/admin-extension-status.service";

describe("AdminExtensionStatusService", () => {
  it("returns manifest version and browser metadata", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService({
      fetchAuthenticatedEmail: async () => null,
    });
    const status = await service.getStatus("http://localhost:3100");

    expect(status.webAppOrigin).toBe("http://localhost:3100");
    expect(status.extensionVersion).toBe("0.0.3");
    expect(status.browser).toBe(navigator.userAgent);
    expect(() => new Date(status.lastHeartbeatAt)).not.toThrow();
    expect(status.authStatus).toBe("unauthenticated");
    expect(status.authenticatedEmail).toBeNull();
  });

  it("parses webAppOrigin from admin.get-status messages", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService({
      fetchAuthenticatedEmail: async () => "user@example.com",
    });
    const status = await service.handleGetStatusMessage({
      kind: "admin.get-status",
      webAppOrigin: "http://localhost:3103",
    });

    expect(status.webAppOrigin).toBe("http://localhost:3103");
    expect(status.authStatus).toBe("authenticated");
    expect(status.authenticatedEmail).toBe("user@example.com");
  });

  it("returns unauthenticated when me lookup fails", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService({
      fetchAuthenticatedEmail: async () => null,
    });
    const status = await service.getStatus("http://localhost:3100");

    expect(status.authStatus).toBe("unauthenticated");
    expect(status.authenticatedEmail).toBeNull();
  });

  it("authenticates via me even without an access token cookie", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService({
      fetchAuthenticatedEmail: async () => "user@example.com",
    });
    const status = await service.getStatus("http://localhost:3100");

    expect(status.authStatus).toBe("authenticated");
    expect(status.authenticatedEmail).toBe("user@example.com");
  });

  it("revalidates auth when refreshAuth is requested", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    let email = "cached@example.com";
    const service = new AdminExtensionStatusService({
      fetchAuthenticatedEmail: async () => email,
    });

    const cached = await service.getStatus("http://localhost:3100");
    expect(cached.authenticatedEmail).toBe("cached@example.com");

    email = "fresh@example.com";
    const refreshed = await service.getStatus("http://localhost:3100", {
      refreshAuth: true,
    });

    expect(refreshed.authenticatedEmail).toBe("fresh@example.com");
  });
});
