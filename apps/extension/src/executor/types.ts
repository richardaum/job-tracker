/**
 * Backend-orchestrated executor actions for the Chrome extension.
 * The service worker runs tab operations; DOM work uses `chrome.scripting.executeScript`.
 */

export type ExecutorErrorCode =
  | "TAB_NOT_FOUND"
  | "TAB_NOT_OWNED"
  | "SCRIPT_INJECTION_FAILED"
  | "ELEMENT_NOT_FOUND"
  | "UNSUPPORTED_ELEMENT"
  | "INVALID_SELECTOR"
  | "PERMISSION_DENIED"
  | "UNKNOWN_ERROR";

export type ExecutorFailure = Readonly<{
  requestId: string;
  ok: false;
  error: Readonly<{ code: ExecutorErrorCode; message: string }>;
}>;

export type ExecutorSuccess<T> = Readonly<{
  requestId: string;
  ok: true;
  data: T;
}>;

export type ExecutorResult = ExecutorFailure | ExecutorSuccess<unknown>;

/** Tab snapshot safe to send back over GraphQL/SSE (no WebSocket handles). */
export type ExecutorTabSnapshot = Readonly<{
  id: number;
  url?: string;
  title?: string;
  active: boolean;
  windowId: number;
}>;

export type TabListAction = Readonly<{
  kind: "tab.list";
  requestId: string;
  query?: chrome.tabs.QueryInfo;
}>;

export type TabOpenAction = Readonly<{
  kind: "tab.open";
  requestId: string;
  createProperties: chrome.tabs.CreateProperties;
  /**
   * When set, sets `createProperties.active` (Chrome: new tab becomes the active tab in the window).
   * `true` — switch to the new tab (default Chrome behavior when `active` is omitted).
   * `false` — open in the background without activating.
   */
  activate?: boolean;
}>;

export type TabCloseAction = Readonly<{
  kind: "tab.close";
  requestId: string;
  tabIds: readonly number[];
}>;

export type TabActivateAction = Readonly<{
  kind: "tab.activate";
  requestId: string;
  tabId: number;
}>;

export type DomQueryAction = Readonly<{
  kind: "dom.query";
  requestId: string;
  tabId: number;
  /**
   * CSS selector (`#id`, `div.foo`) or XPath (`//div`, `/html/body//p`,
   * `(//a)[1]`). Use `xpath=...` / `xpath:` to force XPath when the expression
   * could be ambiguous.
   */
  selector: string;
  /** Max nodes to return (default 50, hard-capped). */
  limit?: number;
}>;

export type DomFocusAction = Readonly<{
  kind: "dom.focus";
  requestId: string;
  tabId: number;
  selector: string;
}>;

export type DomClickAction = Readonly<{
  kind: "dom.click";
  requestId: string;
  tabId: number;
  selector: string;
}>;

export type DomTypeAction = Readonly<{
  kind: "dom.type";
  requestId: string;
  tabId: number;
  selector: string;
  text: string;
  /** When true, append to current value instead of replacing. Default false. */
  append?: boolean;
}>;

/** Resolve human-readable label copy for a field (native label, ARIA, weak fallbacks). */
export type DomFindInputLabelAction = Readonly<{
  kind: "dom.findInputLabel";
  requestId: string;
  tabId: number;
  /** CSS selector for the control (`input`, `textarea`, `select`, or `[contenteditable]`). */
  selector: string;
}>;

export type ExecutorAction =
  | TabListAction
  | TabOpenAction
  | TabCloseAction
  | TabActivateAction
  | DomQueryAction
  | DomFocusAction
  | DomClickAction
  | DomTypeAction
  | DomFindInputLabelAction;
