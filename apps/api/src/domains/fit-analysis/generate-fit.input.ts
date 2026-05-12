import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class GenerateFitInput {
  @Field(() => ID)
  applicationId!: string;

  @Field(() => ID)
  resumeId!: string;
}
