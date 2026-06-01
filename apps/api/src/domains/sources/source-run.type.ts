import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

import { SourceRunStatusEnum } from "./source-run-status.enum";
import { StopWhenEnum } from "./stop-when.enum";

@ObjectType()
export class SourceRunType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  templateId!: string;

  @Field(() => ID)
  planId!: string;

  /** Surface/listing URL for this execution (persisted). */
  @Field(() => String)
  surfaceUrl!: string;

  @Field(() => SourceRunStatusEnum)
  status!: SourceRunStatusEnum;

  @Field(() => String, { nullable: true })
  errorMessage?: string | null;

  @Field()
  startedAt!: Date;

  @Field(() => StopWhenEnum, { nullable: true })
  stopWhen?: StopWhenEnum | null;

  @Field(() => Int, { nullable: true })
  catchUpThreshold?: number | null;

  @Field(() => Int, { nullable: true })
  maxPages?: number | null;

  @Field(() => Int, { nullable: true })
  olderThanDays?: number | null;

  @Field(() => Int)
  jobCount!: number;
}
