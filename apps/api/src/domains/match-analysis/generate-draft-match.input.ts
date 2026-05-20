import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class GenerateDraftMatchInput {
  @Field(() => ID)
  draftJobId!: string;

  @Field(() => ID)
  resumeId!: string;
}
