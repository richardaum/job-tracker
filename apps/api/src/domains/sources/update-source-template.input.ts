import { Field, InputType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@InputType()
export class UpdateSourceTemplateInput {
  @Field(() => String, { nullable: true })
  scheduleCron?: string | null;

  @Field(() => Boolean, { nullable: true })
  scheduleEnabled?: boolean | null;

  @Field(() => String, { nullable: true })
  surfaceUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  config?: Record<string, unknown> | null;
}
