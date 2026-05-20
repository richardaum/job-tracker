import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./job-stage.enum";
import { JobStageEvent } from "./job-stage-events.schema";

@ObjectType()
export class JobStageEventType {
  @Field(() => ID)
  id!: string;

  @Field()
  jobId!: string;

  @Field()
  userId!: string;

  @Field(() => ApplicationStageEnum, { nullable: true })
  fromStage!: JobStageEvent["fromStage"];

  @Field(() => ApplicationStageEnum)
  toStage!: JobStageEvent["toStage"];

  @Field()
  source!: string;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => Date, { nullable: true })
  scheduledAt!: Date | null;

  @Field()
  createdAt!: Date;
}
