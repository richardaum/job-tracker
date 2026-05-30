export const EXTENSION_BRIDGE_SOURCE = "job-tracker-extension-bridge" as const;

export const EXTENSION_BRIDGE_MESSAGE_TYPE = {
  ping: "JOB_TRACKER_EXTENSION_PING",
  pong: "JOB_TRACKER_EXTENSION_PONG",
  sourceRunStart: "JOB_TRACKER_SOURCE_RUN_START",
} as const;

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

export function isAdminGetStatusResponse(
  data: unknown,
): data is ExtensionBridgeStatus {
  if (typeof data !== "object" || data == null) return false;

  const record = data as Record<string, unknown>;
  return (
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

export type SourceRunStartRequest = {
  type: typeof EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart;
  source: typeof EXTENSION_BRIDGE_SOURCE;
  runId: string;
  surfaceUrl: string;
  planId: string;
};

export function isSourceRunStartRequest(
  data: unknown,
): data is SourceRunStartRequest {
  if (typeof data !== "object" || data == null) return false;

  const record = data as Record<string, unknown>;
  return (
    record.type === EXTENSION_BRIDGE_MESSAGE_TYPE.sourceRunStart &&
    record.source === EXTENSION_BRIDGE_SOURCE &&
    typeof record.runId === "string" &&
    typeof record.surfaceUrl === "string"
  );
}

/** Chrome match patterns cannot include a port in the host segment. */
export function toWebAppMatchPattern(webUrl: string): string {
  const url = new URL(webUrl);
  return `${url.protocol}//${url.hostname}/*`;
}
