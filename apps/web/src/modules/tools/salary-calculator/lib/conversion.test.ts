import { describe, expect, it } from "vitest";

import {
  convertSalaryRateBetweenPeriods,
  formatConvertedSalaryRangeLine,
  formatCurrency,
  formatCurrencyWhole,
  hourlyToMonthly,
  hourlyToYearly,
  monthlyToHourly,
  monthlyToYearly,
  yearlyToHourly,
  yearlyToMonthly,
} from "./conversion";

describe("conversion", () => {
  describe("hourly conversions", () => {
    it("converts $50/hr to yearly ($104,000)", () => {
      expect(hourlyToYearly(50)).toBeCloseTo(104000, 2);
    });

    it("converts $50/hr to monthly (~$8,666.67)", () => {
      expect(hourlyToMonthly(50)).toBeCloseTo(8666.67, 2);
    });

    it("converts $0/hr to 0", () => {
      expect(hourlyToYearly(0)).toBe(0);
      expect(hourlyToMonthly(0)).toBe(0);
    });

    it("handles negative values", () => {
      expect(hourlyToYearly(-10)).toBe(-20800);
    });
  });

  describe("yearly conversions", () => {
    it("converts $104,000/yr to hourly ($50)", () => {
      expect(yearlyToHourly(104000)).toBeCloseTo(50, 2);
    });

    it("converts $104,000/yr to monthly (~$8,666.67)", () => {
      expect(yearlyToMonthly(104000)).toBeCloseTo(8666.67, 2);
    });

    it("converts $0/yr to 0", () => {
      expect(yearlyToHourly(0)).toBe(0);
      expect(yearlyToMonthly(0)).toBe(0);
    });
  });

  describe("monthly conversions", () => {
    it("converts $8,666.67/mo to yearly (~$104,000)", () => {
      expect(monthlyToYearly(8666.67)).toBeCloseTo(104000.04, 2);
    });

    it("converts $8,666.67/mo to hourly (~$50)", () => {
      expect(monthlyToHourly(8666.67)).toBeCloseTo(50, 2);
    });

    it("converts $0/mo to 0", () => {
      expect(monthlyToYearly(0)).toBe(0);
      expect(monthlyToHourly(0)).toBe(0);
    });
  });

  describe("convertSalaryRateBetweenPeriods", () => {
    it("returns same value when from === to", () => {
      expect(convertSalaryRateBetweenPeriods(100, "hourly", "hourly")).toBe(
        100,
      );
      expect(convertSalaryRateBetweenPeriods(100, "monthly", "monthly")).toBe(
        100,
      );
      expect(convertSalaryRateBetweenPeriods(100, "yearly", "yearly")).toBe(
        100,
      );
    });

    it("converts hourly to yearly", () => {
      expect(
        convertSalaryRateBetweenPeriods(50, "hourly", "yearly"),
      ).toBeCloseTo(104000, 2);
    });

    it("converts yearly to monthly", () => {
      expect(convertSalaryRateBetweenPeriods(120000, "yearly", "monthly")).toBe(
        10000,
      );
    });

    it("converts monthly to hourly", () => {
      expect(
        convertSalaryRateBetweenPeriods(8666.67, "monthly", "hourly"),
      ).toBeCloseTo(50, 2);
    });
  });

  describe("formatCurrency", () => {
    it("formats USD correctly", () => {
      expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("formats EUR correctly", () => {
      expect(formatCurrency(1234.56, "EUR")).toBe("€1,234.56");
    });

    it("formats BRL correctly", () => {
      expect(formatCurrency(1234.56, "BRL")).toBe("R$1,234.56");
    });

    it("formats GBP correctly", () => {
      expect(formatCurrency(1234.56, "GBP")).toBe("£1,234.56");
    });

    it("formats CHF correctly", () => {
      expect(formatCurrency(1234.56, "CHF")).toContain("CHF");
      expect(formatCurrency(1234.56, "CHF")).toContain("1,234.56");
    });

    it("handles zero", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("handles large numbers", () => {
      expect(formatCurrency(208000, "USD")).toBe("$208,000.00");
    });
  });

  describe("formatCurrencyWhole", () => {
    it("formats without fraction digits", () => {
      expect(formatCurrencyWhole(1234.56, "USD")).toBe("$1,235");
      expect(formatCurrencyWhole(0, "USD")).toBe("$0");
      expect(formatCurrencyWhole(8666.67, "USD")).toBe("$8,667");
    });
  });

  describe("formatConvertedSalaryRangeLine", () => {
    it("formats a range converted to yearly", () => {
      expect(
        formatConvertedSalaryRangeLine(
          8333.33,
          8333.33,
          "monthly",
          "yearly",
          "USD",
        ),
      ).toBe("$100,000");
    });

    it("returns Up to when only max is set", () => {
      expect(
        formatConvertedSalaryRangeLine(null, 50, "hourly", "hourly", "USD"),
      ).toBe("Up to $50");
    });
  });
});
