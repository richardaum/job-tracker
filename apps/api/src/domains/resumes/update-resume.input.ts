import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateResumeInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;
}
