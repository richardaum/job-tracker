import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
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
  });
});
