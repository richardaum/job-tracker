import { describe, expect, it } from "vitest";

import { toWebAppMatchPattern } from "@/domains/web-bridge/extension-bridge.protocol";

describe("toWebAppMatchPattern", () => {
  it("omits port for localhost worktree URLs", () => {
    expect(toWebAppMatchPattern("http://localhost:3103")).toBe(
      "http://localhost/*",
    );
  });

  it("omits port for loopback URLs", () => {
    expect(toWebAppMatchPattern("http://127.0.0.1:3103/admin")).toBe(
      "http://127.0.0.1/*",
    );
  });

  it("builds hostname-only patterns for deployed hosts", () => {
    expect(toWebAppMatchPattern("https://app.example.com/jobs")).toBe(
      "https://app.example.com/*",
    );
  });
});
