import { describe, expect, it, vi } from "vitest";

import { AdminExtensionStatusService } from "@/domains/web-bridge/admin-extension-status.service";

describe("AdminExtensionStatusService", () => {
  it("returns manifest version and browser metadata", () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService();
    const status = service.getStatus("http://localhost:3100");

    expect(status.webAppOrigin).toBe("http://localhost:3100");
    expect(status.extensionVersion).toBe("0.0.3");
    expect(status.browser).toBe(navigator.userAgent);
    expect(() => new Date(status.lastHeartbeatAt)).not.toThrow();
  });

  it("parses webAppOrigin from admin.get-status messages", () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ version: "0.0.3" }) },
    });

    const service = new AdminExtensionStatusService();
    const status = service.handleGetStatusMessage({
      kind: "admin.get-status",
      webAppOrigin: "http://localhost:3103",
    });

    expect(status.webAppOrigin).toBe("http://localhost:3103");
  });
});
