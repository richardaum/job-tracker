import { describe, expect, it } from "vitest";

import { splitPreviewLines } from "./splitPreviewLines";

describe("splitPreviewLines", () => {
  it("skips common job-description section headers", () => {
    const [lineOne, lineTwo] = splitPreviewLines(
      [
        "Job description:",
        "Senior Product Engineer",
        "Responsibilities:",
        "Build AI features for hiring workflow.",
      ].join("\n"),
    );

    expect(lineOne).toBe("Senior Product Engineer");
    expect(lineTwo).toBe("Build AI features for hiring workflow.");
  });

  it("returns empty fallback when only noise exists", () => {
    const [lineOne, lineTwo] = splitPreviewLines(
      ["Responsibilities:", "Requirements:", "Benefits:"].join("\n"),
    );

    expect(lineOne).toBe("(empty paste)");
    expect(lineTwo).toBe("No text content.");
  });
});
