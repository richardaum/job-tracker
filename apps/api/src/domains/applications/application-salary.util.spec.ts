import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";

import { Application } from "./applications.schema";
import { SalaryService } from "./salary.service";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { TagService } from "./tag.service";

describe("Salary and tag logic", () => {
  let salaryService: SalaryService;
  let tagService: TagService;

  beforeEach(() => {
    salaryService = new SalaryService();
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

  describe("SalaryService.getCreateSalary", () => {
    it("returns null values when no amount is provided", () => {
      const result = salaryService.getCreateSalary({});
      expect(result.salaryMinCents).toBeNull();
      expect(result.salaryCurrency).toBeNull();
    });

    it("throws if amount is provided without currency or period", () => {
      expect(() =>
        salaryService.getCreateSalary({ salaryMinCents: 100 }),
      ).toThrow(BadRequestException);
    });

    it("normalizes currency to uppercase", () => {
      const result = salaryService.getCreateSalary({
        salaryMinCents: 100,
        salaryCurrency: "usd",
        salaryPeriod: SalaryPeriodEnum.MONTH,
      });
      expect(result.salaryCurrency).toBe("USD");
    });

    it("validates non-negative amounts and min <= max", () => {
      expect(() =>
        salaryService.getCreateSalary({
          salaryMinCents: -1,
          salaryCurrency: "USD",
          salaryPeriod: SalaryPeriodEnum.MONTH,
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        salaryService.getCreateSalary({
          salaryMinCents: 200,
          salaryMaxCents: 100,
          salaryCurrency: "USD",
          salaryPeriod: SalaryPeriodEnum.MONTH,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe("SalaryService.getUpdateSalary", () => {
    const current = {
      salaryMinCents: 5000,
      salaryMaxCents: 7000,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriodEnum.MONTH,
    } as unknown as Application;

    it("returns null if no salary keys are in input", () => {
      expect(salaryService.getUpdateSalary(current, {})).toBeNull();
    });

    it("merges with current values", () => {
      const result = salaryService.getUpdateSalary(current, {
        salaryMinCents: 6000,
      });
      expect(result?.salaryMinCents).toBe(6000);
      expect(result?.salaryMaxCents).toBe(7000);
    });

    it("allows clearing salary range", () => {
      const result = salaryService.getUpdateSalary(current, {
        salaryMinCents: null,
        salaryMaxCents: null,
      });
      expect(result?.salaryMinCents).toBeNull();
      expect(result?.salaryCurrency).toBeNull();
    });
  });
});
