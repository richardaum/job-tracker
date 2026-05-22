import { describe, expect, it } from "vitest";

import {
  JOB_DETAIL_TITLE_PLACEHOLDER,
  jobDetailDisplayTitle,
} from "./job-detail-title";

describe("jobDetailDisplayTitle", () => {
  it("returns placeholder when title is null or blank", () => {
    expect(jobDetailDisplayTitle(null)).toBe(JOB_DETAIL_TITLE_PLACEHOLDER);
    expect(jobDetailDisplayTitle(undefined)).toBe(JOB_DETAIL_TITLE_PLACEHOLDER);
    expect(jobDetailDisplayTitle("   ")).toBe(JOB_DETAIL_TITLE_PLACEHOLDER);
  });

  it("returns trimmed title when provided", () => {
    expect(jobDetailDisplayTitle("  Backend Eng  ")).toBe("Backend Eng");
    expect(jobDetailDisplayTitle("PM")).toBe("PM");
  });
});
