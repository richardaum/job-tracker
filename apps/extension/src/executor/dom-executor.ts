import type { ChromeExecutorApis } from "./chrome-apis";
import {
  type DomVoidRuntimeResult,
  executorDomClick,
  executorDomFindInputLabel,
  executorDomFocus,
  executorDomQuery,
  executorDomType,
} from "./dom-injected";
import { requireOwnedTab } from "./tab-registry";
import type {
  DomClickAction,
  DomFindInputLabelAction,
  DomFocusAction,
  DomQueryAction,
  DomTypeAction,
  ExecutorErrorCode,
  ExecutorFailure,
  ExecutorResult,
  ExecutorSuccess,
} from "./types";

function ok<T>(requestId: string, data: T): ExecutorSuccess<T> {
  return { requestId, ok: true, data };
}

function fail(
  requestId: string,
  code: ExecutorErrorCode,
  message: string,
): ExecutorFailure {
  return { requestId, ok: false, error: { code, message } };
}

function mapDomVoid(
  requestId: string,
  r: DomVoidRuntimeResult,
): ExecutorResult {
  if (r.ok) {
    return ok(requestId, { done: true as const });
  }
  const code: ExecutorErrorCode =
    r.code === "ELEMENT_NOT_FOUND"
      ? "ELEMENT_NOT_FOUND"
      : "UNSUPPORTED_ELEMENT";
  return fail(requestId, code, r.code);
}

function failFromCatch(requestId: string, e: unknown): ExecutorFailure {
  const message = e instanceof Error ? e.message : String(e);
  const lower = message.toLowerCase();
  if (
    lower.includes("no tab with id") ||
    lower.includes("tab not found") ||
    lower.includes("cannot find tab")
  ) {
    return fail(requestId, "TAB_NOT_FOUND", message);
  }
  if (lower.includes("permission") || lower.includes("cannot access")) {
    return fail(requestId, "PERMISSION_DENIED", message);
  }
  return fail(requestId, "SCRIPT_INJECTION_FAILED", message);
}

const DEFAULT_DOM_LIMIT = 50;

export async function runDomQuery(
  api: ChromeExecutorApis,
  action: DomQueryAction,
): Promise<ExecutorResult> {
  const limit = action.limit ?? DEFAULT_DOM_LIMIT;
  const gate = await requireOwnedTab(action.requestId, action.tabId);
  if (gate != null) {
    return gate;
  }
  try {
    const [injection] = await api.scripting.executeScript({
      target: { tabId: action.tabId },
      func: executorDomQuery,
      args: [action.selector, limit],
    });
    const raw = injection?.result;
    if (raw == null || typeof raw !== "object") {
      return fail(
        action.requestId,
        "SCRIPT_INJECTION_FAILED",
        "No result from executeScript",
      );
    }
    if ("ok" in raw && raw.ok === false) {
      const msg =
        "message" in raw &&
        typeof (raw as { message?: unknown }).message === "string"
          ? (raw as { message: string }).message
          : "Invalid selector";
      return fail(action.requestId, "INVALID_SELECTOR", msg);
    }
    if ("ok" in raw && raw.ok === true && "matches" in raw) {
      return ok(action.requestId, { matches: raw.matches });
    }
    return fail(
      action.requestId,
      "SCRIPT_INJECTION_FAILED",
      "Unexpected inject result shape",
    );
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runDomFocus(
  api: ChromeExecutorApis,
  action: DomFocusAction,
): Promise<ExecutorResult> {
  const gate = await requireOwnedTab(action.requestId, action.tabId);
  if (gate != null) {
    return gate;
  }
  try {
    const [injection] = await api.scripting.executeScript({
      target: { tabId: action.tabId },
      func: executorDomFocus,
      args: [action.selector],
    });
    const raw = injection?.result;
    if (raw == null || typeof raw !== "object" || !("ok" in raw)) {
      return fail(
        action.requestId,
        "SCRIPT_INJECTION_FAILED",
        "No result from executeScript",
      );
    }
    return mapDomVoid(action.requestId, raw as DomVoidRuntimeResult);
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runDomClick(
  api: ChromeExecutorApis,
  action: DomClickAction,
): Promise<ExecutorResult> {
  const gate = await requireOwnedTab(action.requestId, action.tabId);
  if (gate != null) {
    return gate;
  }
  try {
    const [injection] = await api.scripting.executeScript({
      target: { tabId: action.tabId },
      func: executorDomClick,
      args: [action.selector],
    });
    const raw = injection?.result;
    if (raw == null || typeof raw !== "object" || !("ok" in raw)) {
      return fail(
        action.requestId,
        "SCRIPT_INJECTION_FAILED",
        "No result from executeScript",
      );
    }
    return mapDomVoid(action.requestId, raw as DomVoidRuntimeResult);
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runDomType(
  api: ChromeExecutorApis,
  action: DomTypeAction,
): Promise<ExecutorResult> {
  const gate = await requireOwnedTab(action.requestId, action.tabId);
  if (gate != null) {
    return gate;
  }
  try {
    const append = Boolean(action.append);
    const [injection] = await api.scripting.executeScript({
      target: { tabId: action.tabId },
      func: executorDomType,
      args: [action.selector, action.text, append],
    });
    const raw = injection?.result;
    if (raw == null || typeof raw !== "object" || !("ok" in raw)) {
      return fail(
        action.requestId,
        "SCRIPT_INJECTION_FAILED",
        "No result from executeScript",
      );
    }
    return mapDomVoid(action.requestId, raw as DomVoidRuntimeResult);
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}

export async function runDomFindInputLabel(
  api: ChromeExecutorApis,
  action: DomFindInputLabelAction,
): Promise<ExecutorResult> {
  const gate = await requireOwnedTab(action.requestId, action.tabId);
  if (gate != null) {
    return gate;
  }
  try {
    const [injection] = await api.scripting.executeScript({
      target: { tabId: action.tabId },
      func: executorDomFindInputLabel,
      args: [action.selector],
    });
    const raw = injection?.result;
    if (raw == null || typeof raw !== "object" || !("ok" in raw)) {
      return fail(
        action.requestId,
        "SCRIPT_INJECTION_FAILED",
        "No result from executeScript",
      );
    }
    if (raw.ok === false) {
      const code = raw.code;
      const msg =
        "message" in raw &&
        typeof (raw as { message?: unknown }).message === "string"
          ? (raw as { message: string }).message
          : code;
      if (code === "INVALID_SELECTOR") {
        return fail(action.requestId, "INVALID_SELECTOR", msg);
      }
      if (code === "ELEMENT_NOT_FOUND") {
        return fail(
          action.requestId,
          "ELEMENT_NOT_FOUND",
          "No element for selector",
        );
      }
      return fail(
        action.requestId,
        "UNSUPPORTED_ELEMENT",
        "Element is not a supported control",
      );
    }
    if (
      "labelText" in raw &&
      "source" in raw &&
      typeof (raw as { source: unknown }).source === "string"
    ) {
      return ok(action.requestId, {
        labelText: (raw as { labelText: string | null }).labelText,
        source: (raw as { source: string }).source,
      });
    }
    return fail(
      action.requestId,
      "SCRIPT_INJECTION_FAILED",
      "Unexpected findInputLabel result shape",
    );
  } catch (e) {
    return failFromCatch(action.requestId, e);
  }
}
