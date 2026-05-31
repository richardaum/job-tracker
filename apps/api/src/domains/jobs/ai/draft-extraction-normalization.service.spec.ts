import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { tipTapToPlainText } from "@job-tracker/tiptap";
import { beforeEach, describe, expect, it } from "vitest";

import { DraftExtractionNormalizationService } from "./draft-extraction-normalization.service";

describe("DraftExtractionNormalizationService", () => {
  let service: DraftExtractionNormalizationService;

  beforeEach(() => {
    service = new DraftExtractionNormalizationService();
  });

  describe("normalizeExtraction", () => {
    it("produces NormalizedDraftExtraction with salary: SalaryEmbedded", () => {
      const result = service.normalizeExtraction({
        title: "Software Engineer",
        company: "Acme Corp",
        description: "Job description here",
        tags: ["react", "typescript"],
        location: "Remote",
        workRegion: "US",
      });

      expect(result.title).toBe("Software Engineer");
      expect(result.company).toBe("Acme Corp");
      expect(result.salary).toBeInstanceOf(SalaryEmbedded);
      expect(result.tags).toEqual(["react", "typescript"]);
    });

    it("converts major units to cents from nested salary object", () => {
      const result = service.normalizeExtraction({
        title: "Engineer",
        company: "Acme",
        salary: { min: 100, max: 150, currency: "USD", period: "YEAR" },
      });

      expect(result.salary.minCents).toBe(10000);
      expect(result.salary.maxCents).toBe(15000);
      expect(result.salary.currency).toBe("USD");
      expect(result.salary.period).toBe(SalaryPeriodEnum.YEAR);
    });

    it("handles missing salary object → salary with nulls", () => {
      const result = service.normalizeExtraction({
        title: "Engineer",
        company: "Acme",
      });

      expect(result.salary.minCents).toBeNull();
      expect(result.salary.maxCents).toBeNull();
      expect(result.salary.currency).toBeNull();
      expect(result.salary.period).toBeNull();
    });

    it("handles nulls in all salary fields → SalaryEmbedded with nulls", () => {
      const result = service.normalizeExtraction({
        title: "Engineer",
        company: "Acme",
        salary: { min: null, max: null, currency: null, period: null },
      });

      expect(result.salary.minCents).toBeNull();
      expect(result.salary.maxCents).toBeNull();
      expect(result.salary.currency).toBeNull();
      expect(result.salary.period).toBeNull();
    });

    it("reads salary from flat fallback fields when salary object is missing", () => {
      const result = service.normalizeExtraction({
        title: "Engineer",
        company: "Acme",
        salaryMinCents: 50000,
        salaryMaxCents: 75000,
        salaryCurrency: "EUR",
        salaryPeriod: "YEAR",
      });

      expect(result.salary.minCents).toBe(50000);
      expect(result.salary.maxCents).toBe(75000);
      expect(result.salary.currency).toBe("EUR");
      expect(result.salary.period).toBe(SalaryPeriodEnum.YEAR);
    });

    it("normalizes a fully populated extraction record", () => {
      const result = service.normalizeExtraction({
        title: "  Senior Engineer  ",
        company: "  Acme Inc ",
        description: "Build things",
        salary: {
          min: 120_000,
          max: 150_000,
          currency: "USD",
          period: "yearly",
        },
        tags: ["typescript", 123, "react"],
        location: "  Remote US ",
        workRegion: "  AMER ",
      });

      expect(result.title).toBe("Senior Engineer");
      expect(result.company).toBe("Acme Inc");
      expect(result.description).toEqual(expect.stringContaining('"type":"doc"'));
      expect(result.salary.minCents).toBe(12_000_000);
      expect(result.salary.maxCents).toBe(15_000_000);
      expect(result.salary.currency).toBe("USD");
      expect(result.salary.period).toBe(SalaryPeriodEnum.YEAR);
      expect(result.tags).toEqual(["typescript", "react"]);
      expect(result.location).toBe("Remote US");
      expect(result.workRegion).toBe("AMER");
    });

    it("fills title and company defaults when omitted", () => {
      const result = service.normalizeExtraction({
        description: "Some text",
        tags: [],
      });
      expect(result.title).toBe("Untitled role");
      expect(result.company).toBe("Unknown company");
      expect(result.salary.minCents).toBeNull();
      expect(result.salary.maxCents).toBeNull();
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
      expect(result.salary.minCents).toBe(50000);
      expect(result.salary.maxCents).toBe(60000);
      expect(result.salary.currency).toBe("eur");
      expect(result.salary.period).toBe(SalaryPeriodEnum.MONTH);
    });

    it("allows negative salary majors and missing currency (pass-through / nulls)", () => {
      const result = service.normalizeExtraction({
        title: "Y",
        salary: { min: -1, max: 2, currency: "", period: "nope" },
      });
      expect(result.salary.minCents).toBe(-100);
      expect(result.salary.maxCents).toBe(200);
      expect(result.salary.currency).toBeNull();
      expect(result.salary.period).toBeNull();
    });

    it("returns null description for blank or null string inputs", () => {
      expect(service.normalizeExtraction({ title: "T", description: "  " }).description).toBeNull();
      expect(service.normalizeExtraction({ title: "T", description: null }).description).toBeNull();
    });

    it("returns null description when description field is non-string JSON value", () => {
      expect(
        service.normalizeExtraction({ title: "T", description: 42 } as Record<string, unknown>)
          .description,
      ).toBeNull();
    });

    it("normalizes description that is already TipTap JSON", () => {
      const doc = {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hello " }] }],
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
});
