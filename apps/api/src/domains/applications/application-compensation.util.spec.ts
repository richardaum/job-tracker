import { describe, it, expect, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { CompensationService } from "./compensation.service";
import { TagService } from "./tag.service";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { Application } from "./applications.schema";

describe("Compensation and Tag logic", () => {
  let compensationService: CompensationService;
  let tagService: TagService;

  beforeEach(() => {
    compensationService = new CompensationService();
    tagService = new TagService();
  });

  describe("TagService.normalizeTags", () => {
    it("returns empty array for null/undefined", () => {
      expect(tagService.normalizeTags(null)).toEqual([]);
      expect(tagService.normalizeTags(undefined)).toEqual([]);
    });

    it("trims and removes duplicates (case-insensitive keys)", () => {
      expect(
        tagService.normalizeTags([" React ", "react", " TypeScript "]),
      ).toEqual(["React", "TypeScript"]);
    });

    it("limits count and length", () => {
      const longTag = "a".repeat(100);
      const result = tagService.normalizeTags([longTag]);
      expect(result[0]).toHaveLength(32);

      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      expect(tagService.normalizeTags(manyTags)).toHaveLength(8);
    });
  });

  describe("CompensationService.getCreateCompensation", () => {
    it("returns null values when no amount is provided", () => {
      const result = compensationService.getCreateCompensation({});
      expect(result.salaryMinCents).toBeNull();
      expect(result.salaryCurrency).toBeNull();
    });

    it("throws if amount is provided without currency or period", () => {
      expect(() =>
        compensationService.getCreateCompensation({ salaryMinCents: 100 }),
      ).toThrow(BadRequestException);
    });

    it("normalizes currency to uppercase", () => {
      const result = compensationService.getCreateCompensation({
        salaryMinCents: 100,
        salaryCurrency: "usd",
        salaryPeriod: SalaryPeriodEnum.MONTH,
      });
      expect(result.salaryCurrency).toBe("USD");
    });

    it("validates non-negative amounts and min <= max", () => {
      expect(() =>
        compensationService.getCreateCompensation({
          salaryMinCents: -1,
          salaryCurrency: "USD",
          salaryPeriod: SalaryPeriodEnum.MONTH,
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        compensationService.getCreateCompensation({
          salaryMinCents: 200,
          salaryMaxCents: 100,
          salaryCurrency: "USD",
          salaryPeriod: SalaryPeriodEnum.MONTH,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe("CompensationService.getUpdateCompensation", () => {
    const current = {
      salaryMinCents: 5000,
      salaryMaxCents: 7000,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriodEnum.MONTH,
    } as unknown as Application;

    it("returns null if no compensation keys are in input", () => {
      expect(compensationService.getUpdateCompensation(current, {})).toBeNull();
    });

    it("merges with current values", () => {
      const result = compensationService.getUpdateCompensation(current, {
        salaryMinCents: 6000,
      });
      expect(result?.salaryMinCents).toBe(6000);
      expect(result?.salaryMaxCents).toBe(7000);
    });

    it("allows clearing salary range", () => {
      const result = compensationService.getUpdateCompensation(current, {
        salaryMinCents: null,
        salaryMaxCents: null,
      });
      expect(result?.salaryMinCents).toBeNull();
      expect(result?.salaryCurrency).toBeNull();
    });
  });
});
