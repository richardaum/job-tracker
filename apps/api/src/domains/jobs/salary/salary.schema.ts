import type { NewJob } from "@api/domains/jobs/jobs.schema";

import type { SalaryPeriodEnum } from "./salary-period.enum";

export type SalaryInput = {
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriodEnum | null;
};

export type SalaryColumns = Pick<
  NewJob,
  "salaryMinCents" | "salaryMaxCents" | "salaryCurrency" | "salaryPeriod"
>;
