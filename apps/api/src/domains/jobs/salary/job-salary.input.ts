import { Field, InputType, Int } from "@nestjs/graphql";

import { SalaryPeriodEnum } from "./salary-period.enum";

@InputType("JobSalaryInput")
export class JobSalaryInput {
  @Field(() => Int, { nullable: true })
  minCents!: number | null;

  @Field(() => Int, { nullable: true })
  maxCents!: number | null;

  @Field(() => String, { nullable: true })
  currency!: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  period!: SalaryPeriodEnum | null;
}
