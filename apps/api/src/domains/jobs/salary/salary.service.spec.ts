import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";

import { SalaryService } from "./salary.service";
import { SalaryPeriodEnum } from "./salary-period.enum";

describe("SalaryService", () => {
  let salaryService: SalaryService;

  beforeEach(() => {
    salaryService = new SalaryService();
  });

  describe("getCreateSalary", () => {
    it("returns null values when no amount is provided", () => {
      const result = salaryService.getCreateSalary({});
      expect(result.minCents).toBeNull();
      expect(result.currency).toBeNull();
    });

    it("throws if amount is provided without currency or period", () => {
      expect(() => salaryService.getCreateSalary({ minCents: 100 })).toThrow(BadRequestException);
    });

    it("normalizes currency to uppercase", () => {
      const result = salaryService.getCreateSalary({ minCents: 100, currency: "usd", period: SalaryPeriodEnum.Month });
      expect(result.currency).toBe("USD");
    });

    it("validates non-negative amounts and min <= max", () => {
      expect(() =>
        salaryService.getCreateSalary({ minCents: -1, currency: "USD", period: SalaryPeriodEnum.Month }),
      ).toThrow(BadRequestException);

      expect(() =>
        salaryService.getCreateSalary({
          minCents: 200,
          maxCents: 100,
          currency: "USD",
          period: SalaryPeriodEnum.Month,
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe("getUpdateSalary", () => {
    const embedded = new SalaryEmbedded();
    embedded.minCents = 5000;
    embedded.maxCents = 7000;
    embedded.currency = "USD";
    embedded.period = SalaryPeriodEnum.Month;

    const current: Job = { salary: embedded } as unknown as Job;

    it("returns null if no salary keys are in input", () => {
      expect(salaryService.getUpdateSalary(current, {})).toBeNull();
    });

    it("merges with current values", () => {
      const result = salaryService.getUpdateSalary(current, { minCents: 6000 });
      expect(result?.minCents).toBe(6000);
      expect(result?.maxCents).toBe(7000);
    });

    it("allows clearing salary range", () => {
      const result = salaryService.getUpdateSalary(current, { minCents: null, maxCents: null });
      expect(result?.minCents).toBeNull();
      expect(result?.currency).toBeNull();
    });
  });
});
