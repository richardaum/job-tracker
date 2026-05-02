import type { ChromeExecutorApis } from "./chrome-apis";
import { tabToSnapshot } from "./chrome-apis";
import {
  getOwnedTabIdSet,
  registerOpenedTab,
  requireOwnedTab,
} from "./tab-registry";
import type {
  ExecutorErrorCode,
  ExecutorFailure,
  ExecutorResult,
  TabActivateAction,
  TabCloseAction,
  TabListAction,
  TabOpenAction,
} from "./types";

function ok<T>(requestId: string, data: T) {
  return { requestId, ok: true as const, data };
}

function fail(
  requestId: string,
  code: ExecutorErrorCode,
  message: string,
): ExecutorFailure {
  return { requestId, ok: false, error: { code, message } };
}

function failFromCatch(requestId: string, e: unknown): ExecutorFailure {
  const message = e instanceof Error ? e.message : String(e);
  const lower = message.toLowerCase();
  const code =
    lower.includes("permission") || lower.includes("cannot access")
      ? ("PERMISSION_DENIED" as const)
      : ("UNKNOWN_ERROR" as const);
  return fail(requestId, code, message);
}

export async function runTabList(
  api: ChromeExecutorApis,
  action: TabListAction,
): Promise<ExecutorResult> {
  try {
    const owned = await getOwnedTabIdSet();
    const tabs = await api.tabs.query(action.query ?? {});
    const snapshots = tabs
      .filter(
        (t): t is chrome.tabs.Tab & { id: number } =>
          t.id != null && owned.has(t.id),
      )
      .map(tabToSnapshot);
    return ok(action.requestId, { tabs: snapshots });
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runTabOpen(
  api: ChromeExecutorApis,
  action: TabOpenAction,
): Promise<ExecutorResult> {
  try {
    const createProperties: chrome.tabs.CreateProperties = {
      ...action.createProperties,
      ...(action.activate !== undefined ? { active: action.activate } : {}),
    };
    const tab = await api.tabs.create(createProperties);
    if (tab.id == null) {
      return fail(
        action.requestId,
        "UNKNOWN_ERROR",
        "tabs.create returned no tab id",
      );
    }
    await registerOpenedTab(tab.id);
    return ok(action.requestId, { tab: tabToSnapshot(tab) });
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runTabClose(
  api: ChromeExecutorApis,
  action: TabCloseAction,
): Promise<ExecutorResult> {
  try {
    for (const tabId of action.tabIds) {
      const gate = await requireOwnedTab(action.requestId, tabId);
      if (gate != null) {
        return gate;
      }
    }
    await api.tabs.remove([...action.tabIds]);
    return ok(action.requestId, { closedTabIds: [...action.tabIds] });
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runTabActivate(
  api: ChromeExecutorApis,
  action: TabActivateAction,
): Promise<ExecutorResult> {
  try {
    const gate = await requireOwnedTab(action.requestId, action.tabId);
    if (gate != null) {
      return gate;
    }
    await api.tabs.update(action.tabId, { active: true });
    return ok(action.requestId, { tabId: action.tabId });
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}
