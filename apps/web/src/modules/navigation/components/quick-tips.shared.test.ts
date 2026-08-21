import { describe, expect, it } from "vitest";

import { selectNextQuickTip } from "./quick-tips.shared";

const quickTips = [
  { id: "one:v1", summary: "One", description: "One", steps: [], presentation: "paste-shortcut" as const },
  { id: "two:v1", summary: "Two", description: "Two", steps: [], presentation: "paste-shortcut" as const },
  { id: "three:v1", summary: "Three", description: "Three", steps: [], presentation: "paste-shortcut" as const },
];

describe("selectNextQuickTip", () => {
  it("selects the first eligible tip when none has been shown", () => {
    expect(selectNextQuickTip(quickTips, null, [])?.id).toBe("one:v1");
  });

  it("rotates to the next eligible tip after refresh", () => {
    expect(selectNextQuickTip(quickTips, "one:v1", [])?.id).toBe("two:v1");
    expect(selectNextQuickTip(quickTips, "three:v1", [])?.id).toBe("one:v1");
  });

  it("skips dismissed tips", () => {
    expect(selectNextQuickTip(quickTips, "one:v1", ["two:v1"])?.id).toBe("three:v1");
  });

  it("returns null when every tip has been dismissed", () => {
    expect(selectNextQuickTip(quickTips, "one:v1", ["one:v1", "two:v1", "three:v1"])).toBeNull();
  });
});
