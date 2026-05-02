import type { ExecutorFailure } from "./types";

/** `chrome.storage.session` key — exported for tests that stub storage. */
export const OWNED_TAB_IDS_STORAGE_KEY =
  "jobTrackerExecutorOwnedTabIds" as const;

async function readIdSet(): Promise<Set<number>> {
  const bag = await chrome.storage.session.get(OWNED_TAB_IDS_STORAGE_KEY);
  const raw = bag[OWNED_TAB_IDS_STORAGE_KEY];
  if (!Array.isArray(raw)) {
    return new Set();
  }
  return new Set(raw as number[]);
}

async function writeIdSet(ids: Set<number>): Promise<void> {
  await chrome.storage.session.set({ [OWNED_TAB_IDS_STORAGE_KEY]: [...ids] });
}

/** Tabs created by `tab.open` in the executor — the only tabs we may automate. */
export async function registerOpenedTab(tabId: number): Promise<void> {
  const next = await readIdSet();
  next.add(tabId);
  await writeIdSet(next);
}

/** Drop when the tab is gone (user closed, executor closed, or crash recovery). */
export async function releaseTab(tabId: number): Promise<void> {
  const next = await readIdSet();
  next.delete(tabId);
  await writeIdSet(next);
}

export async function getOwnedTabIdSet(): Promise<ReadonlySet<number>> {
  return readIdSet();
}

/**
 * @returns `null` if the tab may be used; otherwise a failure for the executor result.
 */
export async function requireOwnedTab(
  requestId: string,
  tabId: number,
): Promise<ExecutorFailure | null> {
  const owned = await readIdSet();
  if (owned.has(tabId)) {
    return null;
  }
  return {
    requestId,
    ok: false,
    error: {
      code: "TAB_NOT_OWNED",
      message:
        "Tab was not opened by this extension. Only tabs created via tab.open may be listed, closed, activated, or used for DOM actions.",
    },
  };
}
