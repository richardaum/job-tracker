import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateApplicationNoteInput {
  @Field(() => String)
  applicationId!: string;

  @Field()
  content!: string;
}
