import { describe, expect, it } from "vitest";

import { createMatchItemId } from "./match-item-id.util";

describe("createMatchItemId", () => {
  it("returns unique non-empty ids", () => {
    const first = createMatchItemId();
    const second = createMatchItemId();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });
});
