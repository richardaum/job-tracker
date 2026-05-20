import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./application-stage.enum";
import { ApplicationStageEvent } from "./application-stage-events.schema";
import { StageEventSourceEnum } from "./stage-event-source.enum";

@ObjectType()
export class ApplicationStageEventType {
  @Field(() => ID)
  id!: string;

  @Field()
  applicationId!: string;

  @Field()
  userId!: string;

  @Field(() => ApplicationStageEnum, { nullable: true })
  fromStage!: ApplicationStageEvent["fromStage"];

  @Field(() => ApplicationStageEnum)
  toStage!: ApplicationStageEvent["toStage"];

  @Field(() => StageEventSourceEnum)
  source!: StageEventSourceEnum;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => Date, { nullable: true })
  scheduledAt!: Date | null;

  @Field()
  createdAt!: Date;
}
