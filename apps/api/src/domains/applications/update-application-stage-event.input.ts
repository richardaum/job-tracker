import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./application-stage.enum";

@InputType()
export class UpdateApplicationStageEventInput {
  @Field(() => ApplicationStageEnum, { nullable: true })
  toStage?: ApplicationStageEnum;

  @Field(() => Date, { nullable: true })
  scheduledAt?: Date | null;

  @Field(() => String, { nullable: true })
  reason?: string | null;
}
