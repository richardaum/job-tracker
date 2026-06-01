import { Field, ID, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { PlanType } from "./plan.type";
import { SourceRunType } from "./source-run.type";

@ObjectType()
export class SourceTemplateType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  planId!: string;

  @Field(() => PlanType)
  plan!: PlanType;

  @Field(() => String, { nullable: true })
  scheduleCron!: string | null;

  @Field()
  scheduleEnabled!: boolean;

  @Field(() => String)
  surfaceUrl!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  config!: Record<string, unknown> | null;

  @Field()
  createdAt!: Date;

  @Field(() => [SourceRunType])
  runs!: SourceRunType[];
}
