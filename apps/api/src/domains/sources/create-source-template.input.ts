import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSourceTemplateInput {
  @Field(() => ID)
  planId!: string;

  @Field()
  surfaceUrl!: string;
}
