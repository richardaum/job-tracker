import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class GenerateDraftFitInput {
  @Field(() => ID)
  draftApplicationId!: string;

  @Field(() => ID)
  resumeId!: string;
}
