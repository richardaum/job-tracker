import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getOwnedTabIdSet,
  OWNED_TAB_IDS_STORAGE_KEY,
  registerOpenedTab,
  releaseTab,
  requireOwnedTab,
} from "./tab-registry";

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

describe("tab-registry", () => {
  it("registerOpenedTab and releaseTab round-trip", async () => {
    await registerOpenedTab(10);
    await registerOpenedTab(11);
    expect([...(await getOwnedTabIdSet())].sort((a, b) => a - b)).toEqual([
      10, 11,
    ]);
    await releaseTab(10);
    expect([...(await getOwnedTabIdSet())]).toEqual([11]);
  });

  it("requireOwnedTab allows registered ids only", async () => {
    await registerOpenedTab(3);
    expect(await requireOwnedTab("r", 3)).toBeNull();
    const denied = await requireOwnedTab("r", 99);
    expect(denied).not.toBeNull();
    expect(denied?.ok).toBe(false);
    if (denied?.ok === false) {
      expect(denied.error.code).toBe("TAB_NOT_OWNED");
    }
  });
});
