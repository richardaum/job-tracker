import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";

export function asSalaryPeriod(value: unknown): SalaryPeriodEnum | null {
  if (value === "year") return SalaryPeriodEnum.YEAR;
  if (value === "month") return SalaryPeriodEnum.MONTH;
  if (value === "hour") return SalaryPeriodEnum.HOUR;
  return null;
}
