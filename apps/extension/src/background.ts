/** MV3 service worker — install/startup lifecycle; bridges backend executor messages to dispatch. */

import { watchActionConnectivityIcon } from "./action-connectivity-icon";
import { EXECUTOR_MESSAGE_TYPE } from "./executor/constants";
import { dispatchExecutorActionWithGlobalChrome } from "./executor/dispatch";
import { releaseTab } from "./executor/tab-registry";
import type { ExecutorAction } from "./executor/types";
import { getApiBaseUrl } from "./extension-channel/api-url";
import { RECONNECT_CHANNEL_MESSAGE_TYPE } from "./extension-channel/constants";
import { extensionGraphqlChannel } from "./extension-channel/run-extension-channel";

function cookieDomainMatchesApi(cookieDomain: string | undefined): boolean {
  if (cookieDomain == null || cookieDomain.length === 0) {
    return false;
  }
  try {
    const origin = new URL(getApiBaseUrl());
    const host = origin.hostname;
    const d = cookieDomain.replace(/^\./, "");
    if (d === host) {
      return true;
    }
    if (host === "localhost" && (d === "localhost" || d === "127.0.0.1")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  console.info("[job-tracker] extension installed:", details.reason);
});

chrome.runtime.onStartup.addListener(() => {
  console.info("[job-tracker] browser startup — background resumed");
  extensionGraphqlChannel.start();
});

chrome.cookies.onChanged.addListener((change) => {
  if (change.cookie.name !== "access_token") {
    return;
  }
  if (!cookieDomainMatchesApi(change.cookie.domain)) {
    return;
  }
  extensionGraphqlChannel.start();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void releaseTab(tabId);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (
    message != null &&
    typeof message === "object" &&
    (message as { type?: string }).type === RECONNECT_CHANNEL_MESSAGE_TYPE
  ) {
    extensionGraphqlChannel.start();
    sendResponse({ ok: true });
    return true;
  }
  if (
    message != null &&
    typeof message === "object" &&
    (message as { type?: string }).type === EXECUTOR_MESSAGE_TYPE &&
    (message as { action?: unknown }).action != null
  ) {
    void dispatchExecutorActionWithGlobalChrome(
      (message as { action: ExecutorAction }).action,
    ).then(sendResponse);
    return true;
  }
  return false;
});

/** Cold load when the service worker wakes without onStartup (e.g. first message). */
watchActionConnectivityIcon();
extensionGraphqlChannel.start();

export {};
