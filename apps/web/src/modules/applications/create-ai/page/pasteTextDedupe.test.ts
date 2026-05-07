import { describe, expect, it } from "vitest";

import {
  isDuplicatePaste,
  normalizePasteTextForDedupe,
} from "./pasteTextDedupe";

describe("normalizePasteTextForDedupe", () => {
  it("normalizes whitespace and casing", () => {
    expect(normalizePasteTextForDedupe("  Senior\r\nEngineer  ")).toBe(
      "senior engineer",
    );
  });
});

describe("isDuplicatePaste", () => {
  it("returns false when list empty", () => {
    expect(isDuplicatePaste("hello", [])).toBe(false);
  });

  it("detects match against any existing item after normalization", () => {
    const existing = [{ text: "  Senior   Engineer  " }];
    expect(isDuplicatePaste("senior\nengineer", existing)).toBe(true);
  });

  it("does not match different content", () => {
    expect(isDuplicatePaste("a", [{ text: "b" }])).toBe(false);
  });
});
