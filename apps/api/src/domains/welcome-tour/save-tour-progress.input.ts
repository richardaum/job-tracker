import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, MaxLength, Min } from "class-validator";

@InputType()
export class SaveTourProgressInput {
  @Field()
  @MaxLength(128)
  tourId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  tourVersion!: number;

  @Field(() => TourProgressStatusEnum)
  status!: TourProgressStatusEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(255)
  currentStepId?: string | null;
}
