import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { ApplicationType } from "../application.type";
import type { Application } from "../applications.schema";
import { ApplicationSalaryType } from "./salary.type";
import { SalaryPeriodEnum } from "./salary-period.enum";

@Resolver(() => ApplicationType)
export class SalaryResolver {
  @ResolveField(() => ApplicationSalaryType)
  salary(@Parent() app: Application): ApplicationSalaryType {
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
