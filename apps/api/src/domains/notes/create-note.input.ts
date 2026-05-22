import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateNoteInput {
  @Field(() => String)
  jobId!: string;

  @Field()
  content!: string;
}
