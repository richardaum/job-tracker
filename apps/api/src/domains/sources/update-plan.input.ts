import { Field, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class UpdatePlanInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  document?: Record<string, unknown>;
}
