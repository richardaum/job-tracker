/**
 * GraphQL/job salary presentation: nested `job.salary` (min/max cents,
 * currency, period), card suffixes. Rate math lives in `tools/salary-calculator/lib/conversion.ts`.
 */

import { tryRun } from "@job-tracker/try-run";

import type { JobSalary } from "@/gql/graphql";
import { SalaryPeriod } from "@/gql/hooks";
import { formatCurrencyWhole, type SalaryRatePeriodBasis } from "@/modules/tools/salary-calculator/lib/conversion";

export const SALARY_PERIODS: Array<{
  value: SalaryPeriod;
  label: string;
  short: string;
  basis: SalaryRatePeriodBasis;
}> = [
  { value: SalaryPeriod.Year, label: "Per year", short: "yr", basis: "yearly" },
  { value: SalaryPeriod.Month, label: "Per month", short: "mo", basis: "monthly" },
  { value: SalaryPeriod.Hour, label: "Per hour", short: "hr", basis: "hourly" },
];

const PERIOD_TO_SUFFIX: Record<string, string> = { YEAR: "/yr", MONTH: "/mo", HOUR: "/hr" };

export function salaryPeriodToRateBasis(period: SalaryPeriod | null | undefined): SalaryRatePeriodBasis | undefined {
  if (period == null) return undefined;
  return SALARY_PERIODS.find((p) => p.value === period)?.basis;
}

/** Non-negative stored cents → major units for display/math; invalid → null. */
export function majorFromCents(cents: number | null | undefined): number | null {
  if (cents == null || cents < 0) return null;
  return cents / 100;
}

export function formatSalary(salary: JobSalary | null | undefined): string | null {
  if (!salary) return null;
  const has = (salary.minCents != null && salary.minCents >= 0) || (salary.maxCents != null && salary.maxCents >= 0);
  if (!has || !salary.currency || !salary.period) {
    return null;
  }
  const currency = salary.currency;
  const minMajor = majorFromCents(salary.minCents);
  const maxMajor = majorFromCents(salary.maxCents);
  const minS = minMajor != null ? formatCurrencyWhole(minMajor, currency) : null;
  const maxS = maxMajor != null ? formatCurrencyWhole(maxMajor, currency) : null;
  const p = String(salary.period);
  const per = PERIOD_TO_SUFFIX[p] ?? "";
  if (minS && maxS && minS !== maxS) {
    return `${minS} – ${maxS}${per}`;
  }
  if (minS) return `${minS}${per}`;
  if (maxS) return `Up to ${maxS}${per}`;
  return null;
}

/** Normalize typed major-unit strings (strips grouping commas / spaces). */
export function normalizeMajorUnitsString(raw: string): string {
  return raw
    .replace(/,/g, "")
    .replace(/\u202f|\u00a0/g, " ")
    .replace(/\s+/g, "")
    .trim();
}

export function majorToCents(major: string): number | null {
  const t = normalizeMajorUnitsString(major);
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centsToMajorInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(/\.?0+$/, "");
}

/** Max fractional digits for a currency code (Intl / ISO 4217), for masked inputs. */
export function iso4217MaxFractionDigits(currencyCode: string | null | undefined): number {
  const currency = (currencyCode?.trim() || "USD").toUpperCase();
  const [intlErr, digits] = tryRun(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits,
  );
  if (intlErr) {
    return 2;
  }
  return digits ?? 2;
}

export function parseTagInput(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function hasSalaryOnCard(params: { line: string | null; tags: string[] }): boolean {
  return (params.line != null && params.line.length > 0) || params.tags.length > 0;
}
