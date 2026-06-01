import { Field, ID, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class CreateSourceTemplateInput {
  @Field(() => ID)
  planId!: string;

  @Field()
  surfaceUrl!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: Record<string, unknown> | null;
}
