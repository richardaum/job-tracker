export const EXTENSION_BRIDGE_SOURCE = "job-tracker-extension-bridge" as const;

export const EXTENSION_BRIDGE_MESSAGE_TYPE = {
  ping: "JOB_TRACKER_EXTENSION_PING",
  pong: "JOB_TRACKER_EXTENSION_PONG",
} as const;

export const EXTENSION_BRIDGE_PROBE_TIMEOUT_MS = 5_000;

export type ExtensionBridgeAuthStatus = "authenticated" | "unauthenticated";

export type ExtensionBridgePing = {
  type: typeof EXTENSION_BRIDGE_MESSAGE_TYPE.ping;
  source: typeof EXTENSION_BRIDGE_SOURCE;
  requestId: string;
  refreshAuth?: boolean;
};

export type ExtensionBridgeStatus = {
  extensionVersion: string;
  browser: string;
  lastHeartbeatAt: string;
  webAppOrigin: string;
  authStatus: ExtensionBridgeAuthStatus;
  authenticatedEmail: string | null;
};

export type ExtensionBridgePong = ExtensionBridgeStatus & {
  type: typeof EXTENSION_BRIDGE_MESSAGE_TYPE.pong;
  source: typeof EXTENSION_BRIDGE_SOURCE;
  requestId: string;
};

export type CreateExtensionBridgePingOptions = { refreshAuth?: boolean };

export function createExtensionBridgePing(
  requestId: string,
  options?: CreateExtensionBridgePingOptions,
): ExtensionBridgePing {
  return {
    type: EXTENSION_BRIDGE_MESSAGE_TYPE.ping,
    source: EXTENSION_BRIDGE_SOURCE,
    requestId,
    ...(options?.refreshAuth ? { refreshAuth: true } : {}),
  };
}

export function isExtensionBridgePing(
  data: unknown,
): data is ExtensionBridgePing {
  if (typeof data !== "object" || data == null) return false;

  const record = data as Record<string, unknown>;
  return (
    record.type === EXTENSION_BRIDGE_MESSAGE_TYPE.ping &&
    record.source === EXTENSION_BRIDGE_SOURCE &&
    typeof record.requestId === "string" &&
    (record.refreshAuth === undefined || record.refreshAuth === true)
  );
}

export function isExtensionBridgePong(
  data: unknown,
): data is ExtensionBridgePong {
  if (typeof data !== "object" || data == null) return false;

  const record = data as Record<string, unknown>;
  return (
    record.type === EXTENSION_BRIDGE_MESSAGE_TYPE.pong &&
    record.source === EXTENSION_BRIDGE_SOURCE &&
    typeof record.requestId === "string" &&
    typeof record.extensionVersion === "string" &&
    typeof record.browser === "string" &&
    typeof record.lastHeartbeatAt === "string" &&
    typeof record.webAppOrigin === "string" &&
    (record.authStatus === "authenticated" ||
      record.authStatus === "unauthenticated") &&
    (typeof record.authenticatedEmail === "string" ||
      record.authenticatedEmail === null)
  );
}
