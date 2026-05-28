import { Field, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreatePlanInput {
  @Field()
  sourceProfileId!: string;

  @Field()
  displayName!: string;

  @Field(() => GraphQLJSON)
  document!: Record<string, unknown>;
}
