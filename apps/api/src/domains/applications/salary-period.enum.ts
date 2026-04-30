import { registerEnumType } from "@nestjs/graphql";

/** Must match `salary_period` enum values in PostgreSQL. */
export enum SalaryPeriodEnum {
  YEAR = "year",
  MONTH = "month",
  HOUR = "hour",
}

registerEnumType(SalaryPeriodEnum, { name: "SalaryPeriod" });
