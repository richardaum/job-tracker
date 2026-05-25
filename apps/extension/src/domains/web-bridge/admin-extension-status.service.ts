import type { ExtensionBridgeStatus } from "@/domains/web-bridge/extension-bridge.protocol";

export type AdminGetStatusMessage = {
  kind: "admin.get-status";
  webAppOrigin: string;
};

export class AdminExtensionStatusService {
  getStatus(webAppOrigin: string): ExtensionBridgeStatus {
    return {
      extensionVersion: chrome.runtime.getManifest().version,
      browser: navigator.userAgent,
      lastHeartbeatAt: new Date().toISOString(),
      webAppOrigin,
    };
  }

  handleGetStatusMessage(message: unknown): ExtensionBridgeStatus {
    return this.getStatus(parseWebAppOrigin(message));
  }
}

export function parseWebAppOrigin(message: unknown): string {
  if (
    typeof message === "object" &&
    message != null &&
    "webAppOrigin" in message &&
    typeof message.webAppOrigin === "string"
  ) {
    return message.webAppOrigin;
  }

  return "";
}
