import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { IsOptional, MaxLength } from "class-validator";

import { ApplicationSourceEnum } from "./job-source.enum";
import { JOB_TITLE_MAX_LENGTH } from "./job-title.constraints";
import { SalaryPeriodEnum } from "./salary/salary-period.enum";

@InputType()
export class CreateJobInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(JOB_TITLE_MAX_LENGTH)
  title?: string | null;

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(5_242_880)
  htmlContent?: string | null;

  @Field(() => ID, { nullable: true })
  sourceRunId?: string | null;

  /** When true, creates a persisted `jobs` row in {@link ApplicationStageEnum.DRAFT} (replacement for legacy draft-job create). */
  @Field(() => Boolean, { nullable: true })
  createAsDraftCapture?: boolean | null;
}
