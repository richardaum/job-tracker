import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class SourceRunActivityEvent {
  @Field()
  type!: string;

  @Field()
  summary!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payload!: Record<string, unknown> | null;

  @Field()
  occurredAt!: Date;
}
