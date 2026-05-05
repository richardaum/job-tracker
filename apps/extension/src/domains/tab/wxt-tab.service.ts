import { LogService } from "@/domains/log/log.service";

import type { OpenTabOptions, TabService } from "./types";

const logService = new LogService({ prefix: "WxtTabService", level: "debug" });

export class WxtTabService implements TabService {
  async getCurrentTab(): Promise<number> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("Unable to get current tab");
    await this.waitUntilTabComplete(tab.id);
    return tab.id;
  }

  async openTab(url: string, options?: OpenTabOptions): Promise<number> {
    const tab = await chrome.tabs.create({
      url,
      active: options?.focus ?? false,
    });
    if (tab.id == null) {
      throw new Error("Unable to open tab: missing tab id");
    }
    const tabId = tab.id;
    await this.waitUntilTabComplete(tabId);
    return tabId;
  }

  /**
   * Waits until the tab reaches `complete`.
   * Returns immediately if already complete; otherwise listens for updates and polls as fallback.
   */
  async waitUntilTabComplete(tabId: number): Promise<void> {
    const snapshot = await chrome.tabs.get(tabId);
    logService.debug("waitUntilTabComplete", { tabId, snapshot });

    if (snapshot.status === "complete") {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const TIMEOUT_MS = 60_000;
      const POLL_MS = 200;
      let settled = false;

      const cleanup = (): void => {
        globalThis.clearTimeout(timeoutId);
        globalThis.clearInterval(pollId);
        chrome.tabs.onUpdated.removeListener(onUpdated);
      };

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error !== undefined) reject(error);
        else resolve();
      };

      const tryFinishIfComplete = (): void => {
        void chrome.tabs
          .get(tabId)
          .then((tab) => {
            if (tab.status === "complete") {
              finish();
            }
          })
          .catch(() => {});
      };

      const timeoutId = globalThis.setTimeout(() => {
        finish(
          new Error(
            `waitUntilTabComplete(${tabId}) timed out after ${TIMEOUT_MS}ms`,
          ),
        );
      }, TIMEOUT_MS);

      const onUpdated = (
        updatedTabId: number,
        _changeInfo: chrome.tabs.TabChangeInfo,
      ): void => {
        if (updatedTabId !== tabId) return;
        tryFinishIfComplete();
      };

      chrome.tabs.onUpdated.addListener(onUpdated);

      const pollId = globalThis.setInterval(() => {
        tryFinishIfComplete();
      }, POLL_MS);

      tryFinishIfComplete();
    });
  }

  async closeTab(tabId: number | undefined): Promise<void> {
    if (tabId === undefined) return;

    const isTabOpen = await chrome.tabs.get(tabId);
    if (!isTabOpen) return;

    await chrome.tabs.remove(tabId);
  }
}
