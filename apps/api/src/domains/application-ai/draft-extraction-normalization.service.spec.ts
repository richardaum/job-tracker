import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { describe, expect, it } from "vitest";

import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

describe("DraftExtractionNormalizationService", () => {
  const normalization = new DraftExtractionNormalizationService();

  it("normalizes core fields", () => {
    const normalized = normalization.normalizeExtraction({
      title: "Senior Engineer",
      company: "Acme",
      description: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Build things" }],
          },
        ],
      }),
      salary: { min: null, max: null, currency: null, period: null },
      tags: [],
    });

    expect(normalized.title).toBe("Senior Engineer");
    expect(normalized.company).toBe("Acme");
  });

  it("wraps plain text description as TipTap", () => {
    const normalized = normalization.normalizeExtraction({
      title: "T",
      company: "C",
      description: "Line one\nLine two",
    });

    expect(JSON.parse(normalized.description!)).toMatchObject({
      type: "doc",
      content: expect.any(Array),
    });
  });

  it("maps salary period", () => {
    const normalized = normalization.normalizeExtraction({
      title: "T",
      company: "C",
      description: "",
      salary: { min: null, max: null, currency: null, period: "month" },
    });

    expect(normalized.salaryPeriod).toBe(SalaryPeriodEnum.MONTH);
  });

  it("maps nested salary amounts to cents", () => {
    const normalized = normalization.normalizeExtraction({
      title: "T",
      company: "C",
      description: "",
      salary: { min: 5000, max: "6,000.50", currency: "USD", period: "year" },
    });

    expect(normalized.salaryMinCents).toBe(500_000);
    expect(normalized.salaryMaxCents).toBe(600_050);
    expect(normalized.salaryCurrency).toBe("USD");
    expect(normalized.salaryPeriod).toBe(SalaryPeriodEnum.YEAR);
  });

  it("keeps only string tags", () => {
    const normalized = normalization.normalizeExtraction({
      title: "T",
      company: "C",
      description: "",
      tags: ["a", null, "b", 99] as unknown as string[],
    });

    expect(normalized.tags).toEqual(["a", "b"]);
  });
});
