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

export async function wakeExtension(
  timeoutMs = 3_000,
): Promise<ExtensionBridgePong | null> {
  if (typeof window === "undefined") return null;

  const requestId = crypto.randomUUID();
  const ping = createExtensionBridgePing(requestId);
  const origin = window.location.origin;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      resolve(null);
    }, timeoutMs);

    const handler = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== origin) return;
      if (!isExtensionBridgePong(event.data)) return;
      if (event.data.requestId !== requestId) return;

      clearTimeout(timer);
      window.removeEventListener("message", handler);
      resolve(event.data);
    };

    window.addEventListener("message", handler);
    window.postMessage(ping, origin);
  });
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
