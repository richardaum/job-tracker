import { Field, ID, InputType, Int } from "@nestjs/graphql";

import { ApplicationSource } from "./application-source.enum";
import { SalaryPeriodEnum } from "./salary/salary-period.enum";

@InputType()
export class UpdateApplicationInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  company?: string;

  @Field(() => ID, { nullable: true })
  companyId?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => [String], { nullable: true })
  urls?: string[] | null;

  @Field(() => ApplicationSource, { nullable: true })
  source?: ApplicationSource | null;

  @Field(() => Int, { nullable: true })
  salaryMinCents?: number | null;

  @Field(() => Int, { nullable: true })
  salaryMaxCents?: number | null;

  @Field(() => String, { nullable: true })
  salaryCurrency?: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  salaryPeriod?: SalaryPeriodEnum | null;

  @Field(() => [String], { nullable: true })
  tags?: string[] | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  workRegion?: string | null;
}
