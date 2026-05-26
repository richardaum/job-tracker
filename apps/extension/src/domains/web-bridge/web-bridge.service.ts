import { tryRun } from "@job-tracker/try-run";

import type { AdminGetStatusMessage } from "@/domains/web-bridge/admin-extension-status.service";
import {
  EXTENSION_BRIDGE_MESSAGE_TYPE,
  EXTENSION_BRIDGE_SOURCE,
  type ExtensionBridgePing,
  type ExtensionBridgeStatus,
  isAdminGetStatusResponse,
  isExtensionBridgePing,
} from "@/domains/web-bridge/extension-bridge.protocol";

export class WebBridgeService {
  constructor(private readonly expectedWebAppOrigin: string) {}

  start(): () => void {
    const handleWindowMessage = (event: MessageEvent) => {
      if (window.location.origin !== this.expectedWebAppOrigin) return;
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      if (!isExtensionBridgePing(event.data)) return;

      void this.respondToPing(event.data);
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }

  private async respondToPing(ping: ExtensionBridgePing): Promise<void> {
    const message: AdminGetStatusMessage = {
      kind: "admin.get-status",
      webAppOrigin: window.location.origin,
      ...(ping.refreshAuth ? { refreshAuth: true } : {}),
    };

    const [err, response] = await tryRun(
      chrome.runtime.sendMessage<AdminGetStatusMessage, ExtensionBridgeStatus>(
        message,
      ),
    );

    if (err) {
      return;
    }
    if (!isAdminGetStatusResponse(response)) {
      return;
    }
    window.postMessage(
      {
        type: EXTENSION_BRIDGE_MESSAGE_TYPE.pong,
        source: EXTENSION_BRIDGE_SOURCE,
        requestId: ping.requestId,
        ...response,
      },
      window.location.origin,
    );
  }
}
