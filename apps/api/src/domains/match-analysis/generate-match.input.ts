import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class GenerateMatchInput {
  @Field(() => ID)
  jobId!: string;

  @Field(() => ID)
  resumeId!: string;
}
