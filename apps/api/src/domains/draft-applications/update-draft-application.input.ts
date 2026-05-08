import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateDraftApplicationInput {
  @Field(() => String)
  title!: string;
}
