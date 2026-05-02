import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChromeExecutorApis } from "./chrome-apis";
import { dispatchExecutorAction } from "./dispatch";
import { executorDomFindInputLabel, executorDomQuery } from "./dom-injected";
import { OWNED_TAB_IDS_STORAGE_KEY } from "./tab-registry";

function inj<T>(result: T): chrome.scripting.InjectionResult<T>[] {
  return [{ result, documentId: "d", frameId: 0 }];
}

function mockApis(partial: {
  tabs?: Partial<ChromeExecutorApis["tabs"]>;
  scripting?: Partial<ChromeExecutorApis["scripting"]>;
}): ChromeExecutorApis {
  const tabs = {
    query: async () => [] as chrome.tabs.Tab[],
    create: async () => ({}) as chrome.tabs.Tab,
    remove: async () => {},
    update: async () => ({}) as chrome.tabs.Tab,
    ...partial.tabs,
  };
  const scripting = {
    executeScript: async () => inj(undefined),
    ...partial.scripting,
  };
  return { tabs, scripting } as ChromeExecutorApis;
}

const mockSession: Record<string, unknown> = {};

beforeEach(() => {
  for (const k of Object.keys(mockSession)) {
    delete mockSession[k];
  }
  vi.stubGlobal("chrome", {
    storage: {
      session: {
        get: async (keys?: string | string[] | null) => {
          const k =
            keys == null
              ? OWNED_TAB_IDS_STORAGE_KEY
              : typeof keys === "string"
                ? keys
                : Array.isArray(keys) && keys.length > 0
                  ? keys[0]
                  : OWNED_TAB_IDS_STORAGE_KEY;
          return { [k]: mockSession[k] };
        },
        set: async (items: Record<string, unknown>) => {
          Object.assign(mockSession, items);
        },
      },
    },
  } as typeof chrome);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("dispatchExecutorAction", () => {
  it("tab.list returns only executor-owned tab snapshots", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [7];
    const apis = mockApis({
      tabs: {
        query: async () => [
          {
            id: 7,
            windowId: 3,
            url: "https://example.com",
            title: "Ex",
            active: true,
          } as chrome.tabs.Tab,
          {
            id: 99,
            windowId: 3,
            url: "https://other.com",
            title: "Other",
            active: false,
          } as chrome.tabs.Tab,
        ],
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "tab.list",
      requestId: "r1",
      query: { active: true },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.data).toEqual({
      tabs: [
        {
          id: 7,
          windowId: 3,
          url: "https://example.com",
          title: "Ex",
          active: true,
        },
      ],
    });
  });

  it("tab.open registers the new tab id as owned", async () => {
    const apis = mockApis({
      tabs: {
        create: async () =>
          ({
            id: 42,
            windowId: 1,
            url: "https://a.com/",
            title: "A",
            active: true,
          }) as chrome.tabs.Tab,
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "tab.open",
      requestId: "o1",
      createProperties: { url: "https://a.com/" },
    });
    expect(r.ok).toBe(true);
    expect(mockSession[OWNED_TAB_IDS_STORAGE_KEY]).toEqual([42]);
  });

  it("tab.open maps activate false to active: false on tabs.create", async () => {
    let captured: chrome.tabs.CreateProperties | undefined;
    const apis = mockApis({
      tabs: {
        create: async (props) => {
          captured = props;
          return {
            id: 43,
            windowId: 1,
            url: "https://b.com/",
            title: "B",
            active: false,
          } as chrome.tabs.Tab;
        },
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "tab.open",
      requestId: "o2",
      createProperties: { url: "https://b.com/" },
      activate: false,
    });
    expect(r.ok).toBe(true);
    expect(captured).toEqual({ url: "https://b.com/", active: false });
  });

  it("tab.open activate true overrides createProperties.active", async () => {
    let captured: chrome.tabs.CreateProperties | undefined;
    const apis = mockApis({
      tabs: {
        create: async (props) => {
          captured = props;
          return { id: 44, windowId: 1 } as chrome.tabs.Tab;
        },
      },
    });
    await dispatchExecutorAction(apis, {
      kind: "tab.open",
      requestId: "o3",
      createProperties: { url: "https://x.com/", active: false },
      activate: true,
    });
    expect(captured?.active).toBe(true);
  });

  it("dom.query forwards inject result when tab is owned", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [1];
    const apis = mockApis({
      scripting: {
        executeScript: async () =>
          inj({
            ok: true,
            matches: [
              {
                tagName: "DIV",
                id: "",
                className: "",
                textPreview: "hi",
                outerHtmlPreview: "<div",
              },
            ],
          }),
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "dom.query",
      requestId: "q1",
      tabId: 1,
      selector: ".x",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect((r.data as { matches: unknown }).matches).toHaveLength(1);
  });

  it("dom.query returns TAB_NOT_OWNED when tab was not opened by the executor", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [];
    const apis = mockApis({
      scripting: { executeScript: async () => inj({ ok: true, matches: [] }) },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "dom.query",
      requestId: "q0",
      tabId: 1,
      selector: "a",
    });
    expect(r.ok).toBe(false);
    if (r.ok) {
      return;
    }
    expect(r.error.code).toBe("TAB_NOT_OWNED");
  });

  it("dom.click maps ELEMENT_NOT_FOUND when tab is owned", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [2];
    const apis = mockApis({
      scripting: {
        executeScript: async () =>
          inj({ ok: false, code: "ELEMENT_NOT_FOUND" as const }),
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "dom.click",
      requestId: "c1",
      tabId: 2,
      selector: "#missing",
    });
    expect(r.ok).toBe(false);
    if (r.ok) {
      return;
    }
    expect(r.error.code).toBe("ELEMENT_NOT_FOUND");
  });

  it("uses injected executorDomQuery function reference for scripting", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [5];
    let fn: ((s: string, l: number) => unknown) | undefined;
    const apis = mockApis({
      scripting: {
        executeScript: async (opts) => {
          if (typeof opts === "object" && opts != null && "func" in opts) {
            fn = opts.func as (s: string, l: number) => unknown;
          }
          return inj({ ok: true, matches: [] });
        },
      },
    });
    await dispatchExecutorAction(apis, {
      kind: "dom.query",
      requestId: "q2",
      tabId: 5,
      selector: "a",
      limit: 10,
    });
    expect(fn).toBe(executorDomQuery);
  });

  it("dom.findInputLabel returns labelText and source when tab is owned", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [8];
    const apis = mockApis({
      scripting: {
        executeScript: async () =>
          inj({ ok: true, labelText: "Role", source: "label-for" }),
      },
    });
    const r = await dispatchExecutorAction(apis, {
      kind: "dom.findInputLabel",
      requestId: "l1",
      tabId: 8,
      selector: "#role",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) {
      return;
    }
    expect(r.data).toEqual({ labelText: "Role", source: "label-for" });
  });

  it("dom.findInputLabel uses executorDomFindInputLabel in executeScript", async () => {
    mockSession[OWNED_TAB_IDS_STORAGE_KEY] = [9];
    let fn: ((s: string) => unknown) | undefined;
    const apis = mockApis({
      scripting: {
        executeScript: async (opts) => {
          if (typeof opts === "object" && opts != null && "func" in opts) {
            fn = opts.func as (s: string) => unknown;
          }
          return inj({ ok: true, labelText: null, source: "none" });
        },
      },
    });
    await dispatchExecutorAction(apis, {
      kind: "dom.findInputLabel",
      requestId: "l2",
      tabId: 9,
      selector: "#x",
    });
    expect(fn).toBe(executorDomFindInputLabel);
  });
});
