/**
 * Salary **rate-period** math and shared currency formatting (hourly / monthly / yearly).
 *
 * Relationship to `applications/shared/utils/salaryFormat.ts`:
 * - **Here:** conversions between rate bases, `SalaryRatePeriodBasis`, labels for tooltips/UI,
 *   currency strings (`formatCurrency`, `formatCurrencyWhole`), multi-period range lines built on
 *   those conversions (`formatConvertedSalaryRangeLine`).
 * - **salaryFormat:** GraphQL `SalaryPeriod`, stored salary fields (cents, currency, period),
 *   human card line + `/mo`/`/yr`/`/hr` suffixes, form/tag helpers — imports this module only.
 */

import { captureSync } from "@job-tracker/async";

const HOURS_PER_WEEK = 40;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;
const DEFAULT_LOCALE = "en-US";

/** Hourly / monthly / yearly rate bases used by the salary calculator math. */
export const SALARY_RATE_PERIOD_BASES = [
  "hourly",
  "monthly",
  "yearly",
] as const;
export type SalaryRatePeriodBasis = (typeof SALARY_RATE_PERIOD_BASES)[number];

export const SALARY_RATE_PERIOD_LABELS: Record<SalaryRatePeriodBasis, string> =
  { hourly: "Hourly", monthly: "Monthly", yearly: "Yearly" };

function formatCurrencyIntl(
  value: number,
  currency: string,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
  locale: string,
): string {
  const [err, formatted] = captureSync(() =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value),
  );
  if (!err) {
    return formatted;
  }
  if (maximumFractionDigits === 0) {
    return `${currency} ${Math.round(value)}`;
  }
  return `${currency} ${value.toFixed(2)}`;
}

/** Currency with fractional cents (salary calculator, FX outputs). */
export function formatCurrency(
  value: number,
  currency: string,
  locale = DEFAULT_LOCALE,
): string {
  return formatCurrencyIntl(value, currency, 2, 2, locale);
}

/** Whole major units — applications card salary lines, tooltips. */
export function formatCurrencyWhole(
  value: number,
  currency: string,
  locale = DEFAULT_LOCALE,
): string {
  return formatCurrencyIntl(value, currency, 0, 0, locale);
}

export function hourlyToYearly(hourly: number): number {
  return hourly * HOURS_PER_WEEK * WEEKS_PER_YEAR;
}

export function hourlyToMonthly(hourly: number): number {
  return hourlyToYearly(hourly) / MONTHS_PER_YEAR;
}

export function yearlyToHourly(yearly: number): number {
  return yearly / (HOURS_PER_WEEK * WEEKS_PER_YEAR);
}

export function yearlyToMonthly(yearly: number): number {
  return yearly / MONTHS_PER_YEAR;
}

export function monthlyToYearly(monthly: number): number {
  return monthly * MONTHS_PER_YEAR;
}

export function monthlyToHourly(monthly: number): number {
  return yearlyToHourly(monthlyToYearly(monthly));
}

export function convertSalaryRateBetweenPeriods(
  value: number,
  from: SalaryRatePeriodBasis,
  to: SalaryRatePeriodBasis,
): number {
  if (from === to) return value;
  if (from === "hourly") {
    return to === "yearly" ? hourlyToYearly(value) : hourlyToMonthly(value);
  }
  if (from === "yearly") {
    return to === "hourly" ? yearlyToHourly(value) : yearlyToMonthly(value);
  }
  return to === "hourly" ? monthlyToHourly(value) : monthlyToYearly(value);
}

function formatSalaryMajorRangeLine(
  lo: number | null,
  hi: number | null,
  currency: string,
  locale = DEFAULT_LOCALE,
): string | null {
  let a = lo;
  let b = hi;
  if (a != null && b != null && a > b) [a, b] = [b, a];
  if (a == null && b == null) return null;

  const $ = (n: number) => formatCurrencyWhole(n, currency, locale);
  if (a != null && b != null && a !== b) return `${$(a)} – ${$(b)}`;
  if (a != null) return $(a);
  return `Up to ${$(b!)}`;
}

/**
 * Min/max expressed in `from` basis → formatted line in `target` basis
 * (range, single value, or “Up to …”).
 */
export function formatConvertedSalaryRangeLine(
  minMajor: number | null,
  maxMajor: number | null,
  from: SalaryRatePeriodBasis,
  target: SalaryRatePeriodBasis,
  currency: string,
  locale = DEFAULT_LOCALE,
): string | null {
  const c = (n: number) => convertSalaryRateBetweenPeriods(n, from, target);
  const lo = minMajor != null ? c(minMajor) : null;
  const hi = maxMajor != null ? c(maxMajor) : null;
  return formatSalaryMajorRangeLine(lo, hi, currency, locale);
}
