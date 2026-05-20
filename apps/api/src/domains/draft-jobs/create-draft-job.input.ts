import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateDraftJobInput {
  @Field(() => String, { nullable: true })
  url?: string | null;

  @Field()
  title!: string;

  @Field()
  htmlContent!: string;
}
