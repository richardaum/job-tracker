import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

describe("SalaryEmbedded", () => {
  describe("validate()", () => {
    it("passes when all fields are null (empty salary is valid)", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = null;
      salary.maxCents = null;
      salary.currency = null;
      salary.period = null;
      expect(() => salary.validate()).not.toThrow();
    });

    it("throws when minCents is set without currency or period", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = 1000;
      salary.maxCents = null;
      salary.currency = null;
      salary.period = null;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when maxCents is set without currency or period", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = null;
      salary.maxCents = 2000;
      salary.currency = null;
      salary.period = null;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when amount is set without period", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = 1000;
      salary.currency = "USD";
      salary.period = null;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when currency is not valid ISO 4217", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = 1000;
      salary.currency = "us";
      salary.period = SalaryPeriodEnum.Month;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when minCents is negative", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = -1;
      salary.currency = "USD";
      salary.period = SalaryPeriodEnum.Month;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when maxCents is negative", () => {
      const salary = new SalaryEmbedded();
      salary.maxCents = -1;
      salary.currency = "USD";
      salary.period = SalaryPeriodEnum.Month;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("throws when minCents > maxCents", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = 200;
      salary.maxCents = 100;
      salary.currency = "USD";
      salary.period = SalaryPeriodEnum.Month;
      expect(() => salary.validate()).toThrow(BadRequestException);
    });

    it("passes for valid salary with all fields", () => {
      const salary = new SalaryEmbedded();
      salary.minCents = 1000;
      salary.maxCents = 2000;
      salary.currency = "USD";
      salary.period = SalaryPeriodEnum.Month;
      expect(() => salary.validate()).not.toThrow();
    });
  });

  describe("normalize()", () => {
    it("converts lowercase currency to uppercase", () => {
      const salary = new SalaryEmbedded();
      salary.currency = "usd";
      salary.normalize();
      expect(salary.currency).toBe("USD");
    });

    it("trims whitespace from currency", () => {
      const salary = new SalaryEmbedded();
      salary.currency = "  brl  ";
      salary.normalize();
      expect(salary.currency).toBe("BRL");
    });

    it("keeps null currency as null", () => {
      const salary = new SalaryEmbedded();
      salary.currency = null;
      salary.normalize();
      expect(salary.currency).toBeNull();
    });

    it("keeps empty string after trim -> uppercase", () => {
      const salary = new SalaryEmbedded();
      salary.currency = "  ";
      salary.normalize();
      expect(salary.currency).toBe("");
    });

    it("is no-op when all fields are null", () => {
      const salary = new SalaryEmbedded();
      salary.normalize();
      expect(salary.minCents).toBeNull();
      expect(salary.maxCents).toBeNull();
      expect(salary.currency).toBeNull();
      expect(salary.period).toBeNull();
    });
  });
});
