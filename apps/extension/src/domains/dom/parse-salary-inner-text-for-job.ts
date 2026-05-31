import { SalaryPeriod } from "@/gql/graphql";

/** Aligned with `remoteyeah.plan.json` salary validationRegex. */
const SALARY_LINE =
  /(?:BRL\s+|R\s*\$|\$)?\s*([\d,]+)\s*\p{Pd}\s*(?:R\s*\$|\$)?\s*([\d,]+)\s*\/\s*(year|month|hour)/iu;

export type ParsedSalaryForCreateJobInput = {
  salaryMinCents: number;
  salaryMaxCents: number;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
};

/** `Job` is untyped; only accept values our parser produced (or same shape). */
export function isParsedSalaryForCreateJobInput(v: unknown): v is ParsedSalaryForCreateJobInput {
  if (v == null || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.salaryMinCents === "number" &&
    typeof o.salaryMaxCents === "number" &&
    typeof o.salaryCurrency === "string" &&
    typeof o.salaryPeriod === "string" &&
    Object.values(SalaryPeriod).includes(o.salaryPeriod as SalaryPeriod)
  );
}

function parseDigitGroup(s: string): number {
  return Number.parseInt(s.replace(/,/g, ""), 10);
}

function dollarsWholeToCents(amount: number): number {
  if (!Number.isFinite(amount)) return Number.NaN;
  return Math.round(amount * 100);
}

function inferSalaryCurrency(trimmedLine: string): string {
  if (/\bBRL\b/i.test(trimmedLine) || /R\s*\$/i.test(trimmedLine)) {
    return "BRL";
  }
  if (trimmedLine.includes("€")) {
    return "EUR";
  }
  return "USD";
}

/**
 * Parses a salary line (innerText) into fields that map 1:1 onto {@link CreateJobInput}.
 */
export function parseSalaryInnerTextForCreateJob(
  raw: string,
): ParsedSalaryForCreateJobInput | null {
  const trimmed = raw.trim();
  const m = trimmed.match(SALARY_LINE);
  if (!m) return null;

  let minWhole = parseDigitGroup(m[1]!);
  let maxWhole = parseDigitGroup(m[2]!);
  if (minWhole > maxWhole) {
    [minWhole, maxWhole] = [maxWhole, minWhole];
  }

  const periodWord = m[3]!.toLowerCase();
  const salaryPeriod =
    periodWord === "year"
      ? SalaryPeriod.Year
      : periodWord === "month"
        ? SalaryPeriod.Month
        : SalaryPeriod.Hour;

  const salaryMinCents = dollarsWholeToCents(minWhole);
  const salaryMaxCents = dollarsWholeToCents(maxWhole);
  if (
    !Number.isFinite(salaryMinCents) ||
    !Number.isFinite(salaryMaxCents) ||
    salaryMinCents < 0 ||
    salaryMaxCents < 0
  ) {
    return null;
  }

  return {
    salaryMinCents,
    salaryMaxCents,
    salaryCurrency: inferSalaryCurrency(trimmed),
    salaryPeriod,
  };
}
