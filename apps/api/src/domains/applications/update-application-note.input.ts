import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class UpdateApplicationNoteInput {
  @Field({ nullable: true })
  content?: string;

  @Field(() => Int)
  expectedRevision!: number;
}
