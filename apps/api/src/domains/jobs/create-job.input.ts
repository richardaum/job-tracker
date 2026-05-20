import { Field, ID, InputType, Int } from "@nestjs/graphql";

import { ApplicationSourceEnum } from "./job-source.enum";
import { SalaryPeriodEnum } from "./salary/salary-period.enum";

@InputType()
export class CreateJobInput {
  @Field()
  title!: string;

  @Field()
  company!: string;

  @Field(() => ID, { nullable: true })
  companyId?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => [String], { nullable: true })
  urls?: string[] | null;

  @Field(() => ApplicationSourceEnum, { nullable: true })
  source?: ApplicationSourceEnum | null;

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

  @Field(() => ID, { nullable: true })
  sourceRunId?: string | null;
}
