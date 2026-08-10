import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ExportJobData, downloadMarkdown, formatJobAsMarkdown, slugifyFileName } from "./export-job-md";

function fullData(): ExportJobData {
  return {
    job: {
      id: "job-1",
      title: "Senior Backend Engineer",
      company: { name: "Acme Corp" },
      description: "We are looking for a Senior Backend Engineer...",
      urls: ["https://example.com/job/123"],
      source: "Linkedin",
      tags: ["Go", "PostgreSQL", "Kubernetes"],
      location: "San Francisco, CA",
      workRegion: "Remote",
      summary: "Senior role with competitive salary.",
      htmlContent: "<p>HTML content</p>",
      currentStage: "RecruiterScreen",
      currentStageAt: "2026-05-15T10:00:00Z",
      createdAt: "2026-05-01T08:00:00Z",
      salary: { minCents: 15000000, maxCents: 20000000, currency: "USD", period: "Year" },
      match: { scoreRatio: 85, classification: "Positive", matchCount: 12, gapCount: 3, unclearCount: 2 },
    },
    notes: [{ id: "note-1", content: "First round went well.", createdAt: "2026-05-10T14:00:00Z" }],
    stageEvents: [
      { id: "event-1", fromStage: null, toStage: "Applied", createdAt: "2026-05-01T08:00:00Z", reason: null },
      {
        id: "event-2",
        fromStage: "Applied",
        toStage: "RecruiterScreen",
        createdAt: "2026-05-08T09:00:00Z",
        reason: "Phone screen",
      },
    ],
  };
}

describe("slugifyFileName", () => {
  it("returns kebab-case .md filename from title and company", () => {
    expect(slugifyFileName("Senior Backend Engineer", "Acme Corp", "job-1")).toBe(
      "senior-backend-engineer-acme-corp.md",
    );
  });

  it("handles special characters safely", () => {
    expect(slugifyFileName("Hello $ World!", "Foo & Bar", "job-1")).toBe("hello-world-foo-bar.md");
  });

  it("handles multiple consecutive special characters", () => {
    expect(slugifyFileName("What???   Really!!", null, "job-1")).toBe("what-really.md");
  });

  it("falls back to job-{id}.md when title is null", () => {
    expect(slugifyFileName(null, "Acme", "job-1")).toBe("acme.md");
  });

  it("falls back to job-{id}.md when both title and company are null", () => {
    expect(slugifyFileName(null, null, "job-1")).toBe("job-job-1.md");
  });

  it("falls back to job-{id}.md when title is empty string", () => {
    expect(slugifyFileName("", "", "job-42")).toBe("job-job-42.md");
  });

  it("handles leading and trailing whitespace", () => {
    expect(slugifyFileName("  Senior Dev  ", "  Acme  ", "job-1")).toBe("senior-dev-acme.md");
  });
});

describe("formatJobAsMarkdown", () => {
  it("produces well-structured Markdown with all sections present for full data", () => {
    const result = formatJobAsMarkdown(fullData());

    expect(result).toContain("# Senior Backend Engineer");
    expect(result).toContain("**Company**: Acme Corp");
    expect(result).toContain("**Location**: San Francisco, CA");
    expect(result).toContain("**Work Region**: Remote");
    expect(result).toContain("**Stage**: Recruiter Screen");
    expect(result).toContain("**URL**: https://example.com/job/123");
    expect(result).toContain("**Salary**: $150,000 - $200,000 / year (USD)");
    expect(result).toContain("**Tags**: Go, PostgreSQL, Kubernetes");
    expect(result).toContain("**Created**: May 1, 2026");
    expect(result).toContain("**Source**: Linkedin");

    expect(result).toContain("## Summary");
    expect(result).toContain("Senior role with competitive salary.");

    expect(result).toContain("## Description");
    expect(result).toContain("We are looking for a Senior Backend Engineer...");

    expect(result).toContain("## Source Content");
    expect(result).toContain("<p>HTML content</p>");

    expect(result).toContain("## Notes");
    expect(result).toMatch(/### May 10, 2026/);
    expect(result).toContain("First round went well.");

    expect(result).toContain("## Stage History");
    expect(result).toMatch(/→ Applied/);
    expect(result).toContain("Applied → Recruiter Screen");
    expect(result).toContain("*Reason*: Phone screen");

    expect(result).toContain("## Match Analysis");
    expect(result).toContain("**Score**: 85%");
    expect(result).toContain("**Classification**: Positive");
    expect(result).toContain("**Matching items**: 12");
    expect(result).toContain("**Gaps**: 3");
    expect(result).toContain("**Unclear**: 2");
  });

  it("omits optional sections when fields are null or missing", () => {
    const data: ExportJobData = {
      job: {
        id: "job-2",
        title: null,
        company: null,
        description: null,
        urls: [],
        source: null,
        tags: [],
        location: null,
        workRegion: null,
        summary: null,
        htmlContent: null,
        currentStage: "Draft",
        currentStageAt: "2026-06-01T10:00:00Z",
        createdAt: "2026-06-01T10:00:00Z",
        salary: null,
        match: null,
      },
      notes: [],
      stageEvents: [],
    };

    const result = formatJobAsMarkdown(data);

    expect(result).toContain("# Untitled");
    expect(result).toContain("**Company**: N/A");
    expect(result).toContain("**Location**: N/A");
    expect(result).toContain("**Stage**: Draft");
    expect(result).toContain("**Salary**: N/A");
    expect(result).toContain("**Tags**: N/A");
    expect(result).not.toContain("**URL**");
    expect(result).not.toContain("**Work Region**");
    expect(result).not.toContain("**Source**");

    expect(result).not.toContain("## Summary");
    expect(result).not.toContain("## Description");
    expect(result).not.toContain("## Source Content");
    expect(result).not.toContain("## Notes");
    expect(result).not.toContain("## Stage History");
    expect(result).not.toContain("## Match Analysis");
  });

  it("omits Notes and Stage History when arrays are empty", () => {
    const data: ExportJobData = {
      job: {
        id: "job-3",
        title: "Engineer",
        company: { name: "Co" },
        description: null,
        urls: [],
        source: null,
        tags: [],
        location: null,
        workRegion: null,
        summary: null,
        htmlContent: null,
        currentStage: "Applied",
        currentStageAt: "2026-06-01T10:00:00Z",
        createdAt: "2026-06-01T10:00:00Z",
        salary: null,
        match: null,
      },
      notes: [],
      stageEvents: [],
    };

    const result = formatJobAsMarkdown(data);

    expect(result).not.toContain("## Notes");
    expect(result).not.toContain("## Stage History");
  });

  it("handles salary with only minCents", () => {
    const data = fullData();
    data.job.salary = { minCents: 10000000, maxCents: null, currency: null, period: null };

    const result = formatJobAsMarkdown(data);
    expect(result).toContain("**Salary**: From $100,000");
  });

  it("handles salary with only maxCents", () => {
    const data = fullData();
    data.job.salary = { minCents: null, maxCents: 12000000, currency: "USD", period: "Year" };

    const result = formatJobAsMarkdown(data);
    expect(result).toContain("**Salary**: Up to $120,000 / year (USD)");
  });
});

describe("downloadMarkdown", () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let anchorClickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    anchorClickSpy.mockRestore();
  });

  it("creates a Blob with text/markdown MIME type and triggers download", () => {
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");

    downloadMarkdown("# Test", "test.md");

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe("text/markdown");

    expect(appendChild).toHaveBeenCalledOnce();
    const anchor = appendChild.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.tagName).toBe("A");
    expect(anchor.download).toBe("test.md");
    expect(anchor.href).toBe("blob:mock-url");
    expect(anchorClickSpy).toHaveBeenCalledOnce();

    expect(removeChild).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
