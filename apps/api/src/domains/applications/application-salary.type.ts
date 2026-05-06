import { Field, Int, ObjectType } from "@nestjs/graphql";

import { SalaryPeriodEnum } from "./salary-period.enum";

/** Grouped read model for salary columns on Application (resolver-backed). */
@ObjectType("ApplicationSalary")
export class ApplicationSalaryType {
  @Field(() => Int, { nullable: true })
  minCents!: number | null;

  @Field(() => Int, { nullable: true })
  maxCents!: number | null;

  @Field(() => String, { nullable: true })
  currency!: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  period!: SalaryPeriodEnum | null;
}
