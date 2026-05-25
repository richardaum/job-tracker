export const EXTENSION_BRIDGE_SOURCE = "job-tracker-extension-bridge" as const;

export const EXTENSION_BRIDGE_MESSAGE_TYPE = {
  ping: "JOB_TRACKER_EXTENSION_PING",
  pong: "JOB_TRACKER_EXTENSION_PONG",
} as const;

export type ExtensionBridgePing = {
  type: typeof EXTENSION_BRIDGE_MESSAGE_TYPE.ping;
  source: typeof EXTENSION_BRIDGE_SOURCE;
  requestId: string;
};

export type ExtensionBridgeStatus = {
  extensionVersion: string;
  browser: string;
  lastHeartbeatAt: string;
  webAppOrigin: string;
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
    typeof record.requestId === "string"
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
    typeof record.webAppOrigin === "string"
  );
}

/** Chrome match patterns cannot include a port in the host segment. */
export function toWebAppMatchPattern(webUrl: string): string {
  const url = new URL(webUrl);
  return `${url.protocol}//${url.hostname}/*`;
}
