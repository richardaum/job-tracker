import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateDraftJobInput {
  @Field(() => String)
  title!: string;
}
