import { Field, ID, ObjectType } from "@nestjs/graphql";

import { SourceRunType } from "./source-run.type";

@ObjectType()
export class SourceTemplateType {
  @Field(() => ID)
  id!: string;

  @Field()
  sourceProfileId!: string;

  @Field(() => String, { nullable: true })
  scheduleCron!: string | null;

  @Field()
  scheduleEnabled!: boolean;

  @Field(() => String)
  surfaceUrl!: string;

  @Field()
  createdAt!: Date;

  @Field(() => [SourceRunType])
  runs!: SourceRunType[];
}
