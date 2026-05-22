import { JobType } from "@api/domains/jobs/job.type";
import type { Job } from "@api/domains/jobs/jobs.schema";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { JobSalaryType } from "./salary.type";
import { SalaryPeriodEnum } from "./salary-period.enum";

@Resolver(() => JobType)
export class SalaryResolver {
  @ResolveField(() => JobSalaryType)
  salary(@Parent() app: Job): JobSalaryType {
    return {
      minCents: app.salaryMinCents ?? null,
      maxCents: app.salaryMaxCents ?? null,
      currency: app.salaryCurrency ?? null,
      period:
        app.salaryPeriod != null
          ? (app.salaryPeriod as SalaryPeriodEnum)
          : null,
    };
  }
}
