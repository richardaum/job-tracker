import { SalaryPeriod } from "@/gql/hooks";

export const SALARY_PERIODS: Array<{
  value: SalaryPeriod;
  label: string;
  short: string;
}> = [
  { value: SalaryPeriod.Year, label: "Per year", short: "yr" },
  { value: SalaryPeriod.Month, label: "Per month", short: "mo" },
  { value: SalaryPeriod.Hour, label: "Per hour", short: "hr" },
];

const PERIOD_TO_SUFFIX: Record<string, string> = {
  YEAR: "/yr",
  MONTH: "/mo",
  HOUR: "/hr",
};

export function formatSalaryPeriodChip(
  period: SalaryPeriod | null | undefined,
) {
  if (period == null) return null;
  if (period === SalaryPeriod.Year) return "Year";
  if (period === SalaryPeriod.Month) return "Month";
  if (period === SalaryPeriod.Hour) return "Hour";
  return String(period);
}

export function formatCompensationLine(params: {
  salaryMinCents: number | null | undefined;
  salaryMaxCents: number | null | undefined;
  salaryCurrency: string | null | undefined;
  salaryPeriod: SalaryPeriod | null | undefined;
}): string | null {
  const has =
    (params.salaryMinCents != null && params.salaryMinCents >= 0) ||
    (params.salaryMaxCents != null && params.salaryMaxCents >= 0);
  if (!has || !params.salaryCurrency || !params.salaryPeriod) {
    return null;
  }
  const currency = params.salaryCurrency;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  const minS =
    params.salaryMinCents != null
      ? fmt.format(params.salaryMinCents / 100)
      : null;
  const maxS =
    params.salaryMaxCents != null
      ? fmt.format(params.salaryMaxCents / 100)
      : null;
  const p = String(params.salaryPeriod);
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
export function iso4217MaxFractionDigits(
  currencyCode: string | null | undefined,
): number {
  const currency = (currencyCode?.trim() || "USD").toUpperCase();
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function parseTagInput(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function hasCompensationOnCard(params: {
  line: string | null;
  tags: string[];
}): boolean {
  return (
    (params.line != null && params.line.length > 0) || params.tags.length > 0
  );
}
