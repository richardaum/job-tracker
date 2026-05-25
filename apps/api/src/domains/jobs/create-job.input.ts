import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, MaxLength } from "class-validator";

import { ApplicationSourceEnum } from "./job-source.enum";
import { JOB_TITLE_MAX_LENGTH } from "./job-title.constraints";
import { JobSalaryInput } from "./salary/job-salary.input";

@InputType()
export class CreateJobInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(JOB_TITLE_MAX_LENGTH)
  title?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  company?: string | null;

  @Field(() => ID, { nullable: true })
  companyId?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => [String], { nullable: true })
  urls?: string[] | null;

  @Field(() => ApplicationSourceEnum, { nullable: true })
  source?: ApplicationSourceEnum | null;

  @Field(() => JobSalaryInput, { nullable: true })
  salary?: JobSalaryInput;

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

  /** Per-action intent to start automatic fill after draft capture; gated by user `autoFillEnabled` setting. */
  @Field(() => Boolean, { nullable: true })
  autoFill?: boolean | null;
}
