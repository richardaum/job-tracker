import { Field, InputType } from "@nestjs/graphql";

import { ApplicationStageEnum } from "./application-stage.enum";

@InputType()
export class CreateApplicationStageEventInput {
  @Field()
  applicationId!: string;

  @Field(() => ApplicationStageEnum)
  toStage!: ApplicationStageEnum;

  @Field({ nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field({ nullable: true })
  scheduledAt?: Date;
}
