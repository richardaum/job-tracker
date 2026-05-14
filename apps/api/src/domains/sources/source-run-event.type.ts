import { Field, ObjectType } from "@nestjs/graphql";

import { SourceRunType } from "./source-run.type";
import { SourceRunEventTypeEnum } from "./source-run-event-type.enum";

@ObjectType()
export class SourceRunEvent {
  @Field(() => SourceRunEventTypeEnum)
  type!: SourceRunEventTypeEnum;

  @Field()
  occurredAt!: Date;

  @Field(() => SourceRunType)
  run!: SourceRunType;
}
