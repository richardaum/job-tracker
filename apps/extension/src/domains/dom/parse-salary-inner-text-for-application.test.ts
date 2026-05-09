import { describe, expect, it } from "vitest";

import { SalaryPeriod } from "@/gql/graphql";

import { parseSalaryInnerTextForCreateApplication } from "./parse-salary-inner-text-for-application";

describe("parseSalaryInnerTextForCreateApplication", () => {
  it("parses yearly USD range with commas", () => {
    const r = parseSalaryInnerTextForCreateApplication(
      "$120,000 – $150,000 / year",
    );
    expect(r).toEqual({
      salaryMinCents: 120_000_00,
      salaryMaxCents: 150_000_00,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriod.Year,
    });
  });

  it("parses hourly range", () => {
    const r = parseSalaryInnerTextForCreateApplication("$50 - $70 / hour");
    expect(r).toEqual({
      salaryMinCents: 50_00,
      salaryMaxCents: 70_00,
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriod.Hour,
    });
  });

  it("parses BRL range with R$", () => {
    const r = parseSalaryInnerTextForCreateApplication(
      "R$ 120,000 – R$ 150,000 / year",
    );
    expect(r).toEqual({
      salaryMinCents: 120_000_00,
      salaryMaxCents: 150_000_00,
      salaryCurrency: "BRL",
      salaryPeriod: SalaryPeriod.Year,
    });
  });

  it("parses range with BRL prefix", () => {
    const r = parseSalaryInnerTextForCreateApplication(
      "BRL 80,000 – 100,000 / year",
    );
    expect(r).toEqual({
      salaryMinCents: 80_000_00,
      salaryMaxCents: 100_000_00,
      salaryCurrency: "BRL",
      salaryPeriod: SalaryPeriod.Year,
    });
  });

  it("normalizes reversed bounds", () => {
    const r = parseSalaryInnerTextForCreateApplication(
      "$150,000 – $120,000 / year",
    );
    expect(r?.salaryMinCents).toBe(120_000_00);
    expect(r?.salaryMaxCents).toBe(150_000_00);
  });

  it("returns null when line does not match", () => {
    expect(parseSalaryInnerTextForCreateApplication("Negotiable")).toBeNull();
  });
});
