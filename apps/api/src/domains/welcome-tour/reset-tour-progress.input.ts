import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, MaxLength, Min } from "class-validator";

@InputType()
export class ResetTourProgressInput {
  @Field()
  @MaxLength(128)
  tourId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  tourVersion!: number;

  @Field()
  @MaxLength(255)
  currentStepId!: string;
}
