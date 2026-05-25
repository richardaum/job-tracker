import { defineContentScript } from "wxt/utils/define-content-script";

import { toWebAppMatchPattern } from "@/domains/web-bridge/extension-bridge.protocol";
import { WebBridgeService } from "@/domains/web-bridge/web-bridge.service";

const WEB_URL = import.meta.env.WXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

const webAppOrigin = new URL(WEB_URL).origin;

export default defineContentScript({
  matches: [toWebAppMatchPattern(WEB_URL)],
  main() {
    const webBridgeService = new WebBridgeService(webAppOrigin);
    return webBridgeService.start();
  },
});
