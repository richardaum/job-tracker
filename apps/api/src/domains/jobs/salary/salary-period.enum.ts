import { registerEnumType } from "@nestjs/graphql";

/** Must match `salary_period` enum values in PostgreSQL after T-223 migration. */
export enum SalaryPeriodEnum {
  Year = "Year",
  Month = "Month",
  Hour = "Hour",
}

registerEnumType(SalaryPeriodEnum, { name: "SalaryPeriod" });
