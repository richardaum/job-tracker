import type { NewApplication } from "@api/domains/applications/applications.schema";

import type { SalaryPeriodEnum } from "./salary-period.enum";

export type SalaryInput = {
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriodEnum | null;
};

export type SalaryColumns = Pick<
  NewApplication,
  "salaryMinCents" | "salaryMaxCents" | "salaryCurrency" | "salaryPeriod"
>;
