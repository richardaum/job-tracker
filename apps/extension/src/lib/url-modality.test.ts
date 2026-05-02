import { describe, expect, it } from "vitest";

import { inferLinkedInJobsModality } from "./url-modality";

describe("inferLinkedInJobsModality", () => {
  it("detects LinkedIn single-job deeplink", () => {
    expect(
      inferLinkedInJobsModality(
        "https://www.linkedin.com/jobs/view/4404223259",
      ),
    ).toBe("single-job");
  });

  it("detects LinkedIn listing / search hub", () => {
    expect(
      inferLinkedInJobsModality(
        "https://www.linkedin.com/jobs/search?keywords=sre",
      ),
    ).toBe("listing");
  });

  it("returns unknown off-board hosts", () => {
    expect(inferLinkedInJobsModality("https://example.com/jobs/search")).toBe(
      "unknown",
    );
  });

  it("returns unknown on malformed URLs", () => {
    expect(inferLinkedInJobsModality("not-a-url")).toBe("unknown");
  });
});
