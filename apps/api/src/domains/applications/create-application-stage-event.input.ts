import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./application-stage.enum";
import { StageEventSourceEnum } from "./stage-event-source.enum";

@InputType()
export class CreateApplicationStageEventInput {
  @Field()
  applicationId!: string;

  @Field(() => ApplicationStageEnum)
  toStage!: ApplicationStageEnum;

  @Field(() => StageEventSourceEnum, { nullable: true })
  source?: StageEventSourceEnum;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
