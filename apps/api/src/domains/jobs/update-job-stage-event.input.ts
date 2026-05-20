import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./job-stage.enum";

@InputType()
export class UpdateJobStageEventInput {
  @Field(() => ApplicationStageEnum, { nullable: true })
  toStage?: ApplicationStageEnum;

  @Field(() => Date, { nullable: true })
  scheduledAt?: Date | null;

  @Field(() => String, { nullable: true })
  reason?: string | null;
}
