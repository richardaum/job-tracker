import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TourProgressType {
  @Field(() => ID)
  id!: string;

  @Field()
  tourId!: string;

  @Field(() => Int)
  tourVersion!: number;

  @Field(() => TourProgressStatusEnum)
  status!: TourProgressStatusEnum;

  @Field(() => String, { nullable: true })
  currentStepId!: string | null;

  @Field(() => Date, { nullable: true })
  completedAt!: Date | null;

  @Field(() => Date, { nullable: true })
  skippedAt!: Date | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
