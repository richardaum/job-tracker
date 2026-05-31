import { describe, expect, it } from "vitest";

import {
  formatJobPageTabTitle,
  JOB_DETAIL_TITLE_PLACEHOLDER,
  JOB_PAGE_TAB_TITLE_FALLBACK,
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

describe("formatJobPageTabTitle", () => {
  it("returns fallback when title is missing or blank", () => {
    expect(formatJobPageTabTitle(null, null)).toBe(JOB_PAGE_TAB_TITLE_FALLBACK);
    expect(formatJobPageTabTitle("   ", "Acme")).toBe(
      JOB_PAGE_TAB_TITLE_FALLBACK,
    );
  });

  it("includes company and tab label when provided", () => {
    expect(
      formatJobPageTabTitle("Backend Eng", "Acme", { tabLabel: "Match" }),
    ).toBe("Backend Eng @ Acme — Match");
    expect(
      formatJobPageTabTitle("  Backend Eng  ", " Acme ", {
        tabLabel: " Match ",
      }),
    ).toBe("Backend Eng @ Acme — Match");
  });
});
