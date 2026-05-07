import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateDraftApplicationInput {
  @Field()
  url!: string;

  @Field()
  htmlContent!: string;
}
