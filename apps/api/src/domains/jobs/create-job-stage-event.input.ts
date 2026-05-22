import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./job-stage.enum";
import { StageEventSourceEnum } from "./stage-event-source.enum";

@InputType()
export class CreateJobStageEventInput {
  @Field()
  jobId!: string;

  @Field(() => ApplicationStageEnum)
  toStage!: ApplicationStageEnum;

  @Field(() => StageEventSourceEnum, { nullable: true })
  source?: StageEventSourceEnum;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
