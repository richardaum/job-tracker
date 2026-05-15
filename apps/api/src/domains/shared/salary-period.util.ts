import { SalaryPeriodEnum } from "@api/domains/applications/salary/salary-period.enum";

export function asSalaryPeriod(value: unknown): SalaryPeriodEnum | null {
  if (typeof value !== "string") return null;

  const normalized = value.toLowerCase().trim();

  if (normalized.startsWith("year")) return SalaryPeriodEnum.YEAR;
  if (normalized.startsWith("month")) return SalaryPeriodEnum.MONTH;
  if (normalized.startsWith("hour")) return SalaryPeriodEnum.HOUR;

  return null;
}
