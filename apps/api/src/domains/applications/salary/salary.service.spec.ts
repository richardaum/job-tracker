import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";

import type { Application } from "../applications.schema";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { SalaryService } from "./salary.service";

describe("SalaryService", () => {
  let salaryService: SalaryService;

  beforeEach(() => {
    salaryService = new SalaryService();
  });

  describe("getCreateSalary", () => {
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

  describe("getUpdateSalary", () => {
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
