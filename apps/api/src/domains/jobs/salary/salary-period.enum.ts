import { registerEnumType } from "@nestjs/graphql";

/** Must match `salary_period` enum values in PostgreSQL after T-223 migration. */
export enum SalaryPeriodEnum {
  YEAR = "YEAR",
  MONTH = "MONTH",
  HOUR = "HOUR",
}

registerEnumType(SalaryPeriodEnum, { name: "SalaryPeriod" });
