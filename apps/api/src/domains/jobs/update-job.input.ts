import { Field, ID, InputType } from "@nestjs/graphql";

import { ApplicationSourceEnum } from "./job-source.enum";
import { JobSalaryInput } from "./salary/job-salary.input";

@InputType()
export class UpdateJobInput {
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
}
