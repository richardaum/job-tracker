import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateNoteInput {
  @Field(() => String)
  applicationId!: string;

  @Field()
  content!: string;
}
