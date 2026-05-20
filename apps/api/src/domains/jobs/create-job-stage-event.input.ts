import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./job-stage.enum";

@InputType()
export class CreateJobStageEventInput {
  @Field()
  jobId!: string;

  @Field(() => ApplicationStageEnum)
  toStage!: ApplicationStageEnum;

  @Field({ nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
