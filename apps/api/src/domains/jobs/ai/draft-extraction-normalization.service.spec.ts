import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { describe, expect, it } from "vitest";

import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

describe("DraftExtractionNormalizationService", () => {
  const service = new DraftExtractionNormalizationService();

  it("normalizes a fully populated extraction record", () => {
    const result = service.normalizeExtraction({
      title: "  Senior Engineer  ",
      company: "  Acme Inc ",
      description: "Build things",
      salary: { min: 120_000, max: 150_000, currency: "USD", period: "yearly" },
      tags: ["typescript", 123, "react"],
      location: "  Remote US ",
      workRegion: "  AMER ",
    });

    expect(result).toEqual({
      title: "Senior Engineer",
      company: "Acme Inc",
      description: expect.stringContaining('"type":"doc"'),
      salaryMinCents: 12_000_000,
      salaryMaxCents: 15_000_000,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriodEnum.YEAR,
      tags: ["typescript", "react"],
      location: "Remote US",
      workRegion: "AMER",
    });
  });

  it("fills title and company defaults when omitted", () => {
    const result = service.normalizeExtraction({
      description: "Some text",
      tags: [],
    });
    expect(result.title).toBe("Untitled role");
    expect(result.company).toBe("Unknown company");
    expect(result.salaryMinCents).toBeNull();
    expect(result.salaryMaxCents).toBeNull();
    expect(result.tags).toEqual([]);
  });

  it("accepts flattened salary scalar fields when salary object is absent", () => {
    const result = service.normalizeExtraction({
      title: "X",
      salaryMinCents: "50000",
      salaryMaxCents: 60000,
      salaryCurrency: "eur",
      salaryPeriod: "MONTH",
    });
    expect(result.salaryMinCents).toBe(50000);
    expect(result.salaryMaxCents).toBe(60000);
    expect(result.salaryCurrency).toBe("eur");
    expect(result.salaryPeriod).toBe(SalaryPeriodEnum.MONTH);
  });

  it("allows negative salary majors and missing currency (pass-through / nulls)", () => {
    const result = service.normalizeExtraction({
      title: "Y",
      salary: { min: -1, max: 2, currency: "", period: "nope" },
    });
    expect(result.salaryMinCents).toBe(-100);
    expect(result.salaryMaxCents).toBe(200);
    expect(result.salaryCurrency).toBeNull();
    expect(result.salaryPeriod).toBeNull();
  });

  it("returns null description for blank or null string inputs", () => {
    expect(
      service.normalizeExtraction({ title: "T", description: "  " })
        .description,
    ).toBeNull();
    expect(
      service.normalizeExtraction({ title: "T", description: null })
        .description,
    ).toBeNull();
  });

  it("returns null description when description field is non-string JSON value", () => {
    expect(
      service.normalizeExtraction({ title: "T", description: 42 } as Record<
        string,
        unknown
      >).description,
    ).toBeNull();
  });

  it("normalizes description that is already TipTap JSON", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello " }] },
      ],
    };
    const result = service.normalizeExtraction({
      title: "T",
      description: JSON.stringify(doc),
    });
    expect(result.description).toBeTruthy();
    const parsed = JSON.parse(result.description!);
    expect(parsed.type).toBe("doc");
  });

  it("handles unicode and HTML-like plain text descriptions", () => {
    const text = "Café <script>x</script> — 日本語";
    const result = service.normalizeExtraction({
      title: "T",
      description: text,
    });
    expect(tipTapToPlainText(result.description!)).toContain("Café");
    expect(tipTapToPlainText(result.description!)).toContain("日本語");
  });
});
