import { describe, it, expect } from "vitest";
import { BadRequestException } from "@nestjs/common";
import {
  normalizeTags,
  assertValidCompensationState,
  mergeCompensationForUpdate,
  normalizeCreateCompensation,
} from "./application-compensation.util";
import { SalaryPeriodEnum } from "./salary-period.enum";
import type { Application } from "./applications.schema";

const makeApp = (overrides: Partial<Application> = {}): Application => ({
  id: "app-1",
  userId: "user-1",
  title: "Engineer",
  company: "Acme",
  description: null,
  url: null,
  salaryMinCents: null,
  salaryMaxCents: null,
  salaryCurrency: null,
  salaryPeriod: null,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("normalizeTags", () => {
  it("returns empty array for null, undefined, or empty input", () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags([])).toEqual([]);
  });

  it("trims whitespace from each tag", () => {
    expect(normalizeTags(["  react  "])).toEqual(["react"]);
  });

  it("deduplicates case-insensitively, keeping first occurrence", () => {
    expect(normalizeTags(["React", "react", "REACT"])).toEqual(["React"]);
  });

  it("skips blank-only tags after trimming", () => {
    expect(normalizeTags(["   ", "valid"])).toEqual(["valid"]);
  });

  it("truncates tags exceeding 32 characters", () => {
    const long = "a".repeat(40);
    const [tag] = normalizeTags([long]);
    expect(tag).toHaveLength(32);
  });

  it("caps output at 8 tags", () => {
    const tags = Array.from({ length: 12 }, (_, i) => `tag${i}`);
    expect(normalizeTags(tags)).toHaveLength(8);
  });
});

describe("assertValidCompensationState", () => {
  it("does not throw when all fields are null", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: null,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
      }),
    ).not.toThrow();
  });

  it("throws when salary amount is set but currency or period is missing", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: 1000,
        salaryMaxCents: null,
        salaryCurrency: null,
        salaryPeriod: null,
      }),
    ).toThrow(BadRequestException);
  });

  it("throws for currency that is not a 3-letter uppercase code", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: 1000,
        salaryMaxCents: null,
        salaryCurrency: "us",
        salaryPeriod: SalaryPeriodEnum.YEAR,
      }),
    ).toThrow("salaryCurrency must be a 3-letter ISO 4217 code");
  });

  it("throws for negative salaryMinCents", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: -1,
        salaryMaxCents: null,
        salaryCurrency: "USD",
        salaryPeriod: SalaryPeriodEnum.YEAR,
      }),
    ).toThrow("salaryMinCents must be non-negative");
  });

  it("throws for negative salaryMaxCents", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: null,
        salaryMaxCents: -1,
        salaryCurrency: "USD",
        salaryPeriod: SalaryPeriodEnum.YEAR,
      }),
    ).toThrow("salaryMaxCents must be non-negative");
  });

  it("throws when min is greater than max", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: 5000,
        salaryMaxCents: 1000,
        salaryCurrency: "USD",
        salaryPeriod: SalaryPeriodEnum.YEAR,
      }),
    ).toThrow("salaryMinCents must be less than or equal to salaryMaxCents");
  });

  it("does not throw for valid min/max range", () => {
    expect(() =>
      assertValidCompensationState({
        salaryMinCents: 1000,
        salaryMaxCents: 5000,
        salaryCurrency: "BRL",
        salaryPeriod: SalaryPeriodEnum.MONTH,
      }),
    ).not.toThrow();
  });
});

describe("mergeCompensationForUpdate", () => {
  it("returns null when no salary fields are present in input", () => {
    expect(mergeCompensationForUpdate(makeApp(), {})).toBeNull();
  });

  it("merges provided field with existing values", () => {
    const app = makeApp({
      salaryMinCents: 5000,
      salaryMaxCents: 10000,
      salaryCurrency: "USD",
      salaryPeriod: "year",
    });
    const result = mergeCompensationForUpdate(app, { salaryMinCents: 6000 });
    expect(result?.salaryMinCents).toBe(6000);
    expect(result?.salaryMaxCents).toBe(10000);
  });

  it("normalizes currency to uppercase", () => {
    const result = mergeCompensationForUpdate(makeApp(), {
      salaryMinCents: 1000,
      salaryCurrency: "brl",
      salaryPeriod: SalaryPeriodEnum.MONTH,
    });
    expect(result?.salaryCurrency).toBe("BRL");
  });

  it("sets currency to null when empty string is passed", () => {
    const app = makeApp({
      salaryMinCents: 1000,
      salaryCurrency: "USD",
      salaryPeriod: "year",
    });
    expect(() =>
      mergeCompensationForUpdate(app, { salaryCurrency: "" }),
    ).toThrow(BadRequestException);
  });

  it("throws for invalid resulting compensation state", () => {
    expect(() =>
      mergeCompensationForUpdate(makeApp(), { salaryMinCents: 1000 }),
    ).toThrow(BadRequestException);
  });

  it("returns all-null columns when resulting amounts are both null", () => {
    const app = makeApp({ salaryMinCents: null, salaryMaxCents: null });
    const result = mergeCompensationForUpdate(app, { salaryMinCents: null });
    expect(result?.salaryMinCents).toBeNull();
    expect(result?.salaryCurrency).toBeNull();
  });
});

describe("normalizeCreateCompensation", () => {
  it("returns all-null columns when no fields provided", () => {
    const result = normalizeCreateCompensation({});
    expect(result.salaryMinCents).toBeNull();
    expect(result.salaryMaxCents).toBeNull();
    expect(result.salaryCurrency).toBeNull();
    expect(result.salaryPeriod).toBeNull();
  });

  it("normalizes currency to uppercase", () => {
    const result = normalizeCreateCompensation({
      salaryMinCents: 5000,
      salaryCurrency: "usd",
      salaryPeriod: SalaryPeriodEnum.YEAR,
    });
    expect(result.salaryCurrency).toBe("USD");
  });

  it("trims whitespace from currency", () => {
    const result = normalizeCreateCompensation({
      salaryMinCents: 5000,
      salaryCurrency: "  USD  ",
      salaryPeriod: SalaryPeriodEnum.YEAR,
    });
    expect(result.salaryCurrency).toBe("USD");
  });

  it("throws for invalid compensation state", () => {
    expect(() => normalizeCreateCompensation({ salaryMinCents: 1000 })).toThrow(
      BadRequestException,
    );
  });
});
