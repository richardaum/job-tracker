import { Field, ID, ObjectType } from "@nestjs/graphql";

import { SourceRunStatusEnum } from "./source-run-status.enum";

@ObjectType()
export class SourceRunType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  templateId!: string;

  @Field()
  sourceProfileId!: string;

  /** Surface/listing URL for this execution (persisted). */
  @Field(() => String)
  surfaceUrl!: string;

  @Field(() => SourceRunStatusEnum)
  status!: SourceRunStatusEnum;

  @Field()
  startedAt!: Date;

  /** Aligns with web `SourceRun.sourceProfile`: server-backed runs use `database`. */
  @Field()
  sourceProfile!: string;
}
