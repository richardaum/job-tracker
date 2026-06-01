import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";

export function asSalaryPeriod(value: unknown): SalaryPeriodEnum | null {
  if (typeof value !== "string") return null;

  const normalized = value.toLowerCase().trim();

  if (normalized.startsWith("year")) return SalaryPeriodEnum.Year;
  if (normalized.startsWith("month")) return SalaryPeriodEnum.Month;
  if (normalized.startsWith("hour")) return SalaryPeriodEnum.Hour;

  return null;
}
