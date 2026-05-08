import { Field, ObjectType } from "@nestjs/graphql";

import { ImportRunType } from "./import-run.type";
import { ImportRunEventTypeEnum } from "./import-run-event-type.enum";

@ObjectType()
export class ImportRunEvent {
  @Field(() => ImportRunEventTypeEnum)
  type!: ImportRunEventTypeEnum;

  @Field()
  occurredAt!: Date;

  @Field(() => ImportRunType)
  run!: ImportRunType;
}
