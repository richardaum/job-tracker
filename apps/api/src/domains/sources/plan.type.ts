import { Field, ID, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { type ExecutorPlanDocument } from "./plan.types";

@ObjectType()
export class PlanType {
  @Field(() => ID)
  id!: string;

  @Field()
  displayName!: string;

  @Field(() => GraphQLJSON)
  document!: ExecutorPlanDocument;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
