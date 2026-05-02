import type { ExecutorTabSnapshot } from "./types";

/**
 * Narrow Chrome surface used by the executor — easy to mock in tests.
 */
export type ChromeExecutorApis = Readonly<{
  tabs: Pick<typeof chrome.tabs, "query" | "create" | "remove" | "update">;
  scripting: Pick<typeof chrome.scripting, "executeScript">;
}>;

export function getDefaultChromeExecutorApis(): ChromeExecutorApis {
  return { tabs: chrome.tabs, scripting: chrome.scripting };
}

export function tabToSnapshot(tab: chrome.tabs.Tab): ExecutorTabSnapshot {
  const id = tab.id;
  const windowId = tab.windowId;
  if (id == null || windowId == null) {
    throw new Error("tabToSnapshot: tab id and windowId are required");
  }
  return {
    id,
    url: tab.url,
    title: tab.title,
    active: Boolean(tab.active),
    windowId,
  };
}
