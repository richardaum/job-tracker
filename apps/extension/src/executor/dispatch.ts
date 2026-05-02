import type { ChromeExecutorApis } from "./chrome-apis";
import { getDefaultChromeExecutorApis } from "./chrome-apis";
import {
  runDomClick,
  runDomFindInputLabel,
  runDomFocus,
  runDomQuery,
  runDomType,
} from "./dom-executor";
import {
  runTabActivate,
  runTabClose,
  runTabList,
  runTabOpen,
} from "./tab-executor";
import type { ExecutorAction, ExecutorResult } from "./types";

/**
 * Runs a single backend-requested action and returns a correlated result.
 * Intended for handlers that stream instructions from the backend (e.g. GraphQL-over-SSE).
 */
export async function dispatchExecutorAction(
  apis: ChromeExecutorApis,
  action: ExecutorAction,
): Promise<ExecutorResult> {
  switch (action.kind) {
    case "tab.list":
      return runTabList(apis, action);
    case "tab.open":
      return runTabOpen(apis, action);
    case "tab.close":
      return runTabClose(apis, action);
    case "tab.activate":
      return runTabActivate(apis, action);
    case "dom.query":
      return runDomQuery(apis, action);
    case "dom.focus":
      return runDomFocus(apis, action);
    case "dom.click":
      return runDomClick(apis, action);
    case "dom.type":
      return runDomType(apis, action);
    case "dom.findInputLabel":
      return runDomFindInputLabel(apis, action);
  }
}

/** Convenience for the service worker using the real `chrome.*` APIs. */
export function dispatchExecutorActionWithGlobalChrome(
  action: ExecutorAction,
): Promise<ExecutorResult> {
  return dispatchExecutorAction(getDefaultChromeExecutorApis(), action);
}
