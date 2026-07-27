import { describe, expect, it } from "vitest";

import {
  EXTENSION_BRIDGE_SOURCE,
  EXTENSION_BRIDGE_MESSAGE_TYPE,
  isExtensionBridgePing,
  isAdminGetStatusResponse,
  isSourceRunStartRequest,
  toWebAppMatchPattern,
} from "@/domains/web-bridge/extension-bridge.protocol";

describe("toWebAppMatchPattern", () => {
  it("omits port for localhost worktree URLs", () => {
    expect(toWebAppMatchPattern("http://localhost:3103")).toBe("http://localhost/*");
  });

  it("omits port for loopback URLs", () => {
    expect(toWebAppMatchPattern("http://127.0.0.1:3103/admin")).toBe("http://127.0.0.1/*");
  });

  it("builds hostname-only patterns for deployed hosts", () => {
    expect(toWebAppMatchPattern("https://app.example.com/jobs")).toBe("https://app.example.com/*");
  });
});

describe("isExtensionBridgePing", () => {
  it("returns false for null", () => {
    expect(isExtensionBridgePing(null)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isExtensionBridgePing("string")).toBe(false);
  });

  it("returns false for object with wrong type", () => {
    expect(isExtensionBridgePing({ type: "foo" })).toBe(false);
  });

  it("returns false for object with wrong source", () => {
    expect(
      isExtensionBridgePing({ type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping, source: "other-source", requestId: "abc" }),
    ).toBe(false);
  });

  it("returns false when requestId is not a string", () => {
    expect(
      isExtensionBridgePing({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping,
        source: EXTENSION_BRIDGE_SOURCE,
        requestId: 123,
      }),
    ).toBe(false);
  });

  it("returns true for valid ping without refreshAuth", () => {
    expect(
      isExtensionBridgePing({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping,
        source: EXTENSION_BRIDGE_SOURCE,
        requestId: "abc-123",
      }),
    ).toBe(true);
  });

  it("returns true for valid ping with refreshAuth=true", () => {
    expect(
      isExtensionBridgePing({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping,
        source: EXTENSION_BRIDGE_SOURCE,
        requestId: "abc-123",
        refreshAuth: true,
      }),
    ).toBe(true);
  });
});

describe("isAdminGetStatusResponse", () => {
  it("returns false for null", () => {
    expect(isAdminGetStatusResponse(null)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isAdminGetStatusResponse(42)).toBe(false);
  });

  it("returns false when missing required fields", () => {
    expect(isAdminGetStatusResponse({})).toBe(false);
  });

  it("returns false when authStatus is invalid", () => {
    expect(
      isAdminGetStatusResponse({
        extensionVersion: "1.0.0",
        browser: "Chrome",
        lastHeartbeatAt: "2024-01-01T00:00:00.000Z",
        webAppOrigin: "http://localhost:3100",
        authStatus: "invalid",
        authenticatedEmail: null,
      }),
    ).toBe(false);
  });

  it("returns true for valid response with authenticated status", () => {
    expect(
      isAdminGetStatusResponse({
        extensionVersion: "1.0.0",
        browser: "Chrome",
        lastHeartbeatAt: "2024-01-01T00:00:00.000Z",
        webAppOrigin: "http://localhost:3100",
        authStatus: "authenticated",
        authenticatedEmail: "user@example.com",
      }),
    ).toBe(true);
  });

  it("returns true for valid response with unauthenticated status and null email", () => {
    expect(
      isAdminGetStatusResponse({
        extensionVersion: "1.0.0",
        browser: "Chrome",
        lastHeartbeatAt: "2024-01-01T00:00:00.000Z",
        webAppOrigin: "http://localhost:3100",
        authStatus: "unauthenticated",
        authenticatedEmail: null,
      }),
    ).toBe(true);
  });
});

describe("isSourceRunStartRequest", () => {
  it("returns false for null", () => {
    expect(isSourceRunStartRequest(null)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isSourceRunStartRequest("nope")).toBe(false);
  });

  it("returns false when missing type", () => {
    expect(
      isSourceRunStartRequest({ source: EXTENSION_BRIDGE_SOURCE, runId: "run-1", surfaceUrl: "https://example.com" }),
    ).toBe(false);
  });

  it("returns false when missing source", () => {
    expect(
      isSourceRunStartRequest({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart,
        runId: "run-1",
        surfaceUrl: "https://example.com",
      }),
    ).toBe(false);
  });

  it("returns false when runId is not a string", () => {
    expect(
      isSourceRunStartRequest({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart,
        source: EXTENSION_BRIDGE_SOURCE,
        runId: 999,
        surfaceUrl: "https://example.com",
      }),
    ).toBe(false);
  });

  it("returns false when surfaceUrl is not a string", () => {
    expect(
      isSourceRunStartRequest({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart,
        source: EXTENSION_BRIDGE_SOURCE,
        runId: "run-1",
        surfaceUrl: 123,
      }),
    ).toBe(false);
  });

  it("returns true for valid request", () => {
    expect(
      isSourceRunStartRequest({
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart,
        source: EXTENSION_BRIDGE_SOURCE,
        runId: "run-1",
        surfaceUrl: "https://example.com/jobs",
        planId: "plan-abc",
      }),
    ).toBe(true);
  });
});
