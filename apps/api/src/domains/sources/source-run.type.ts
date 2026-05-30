import { Field, ID, ObjectType } from "@nestjs/graphql";

import { SourceRunStatusEnum } from "./source-run-status.enum";

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
}
