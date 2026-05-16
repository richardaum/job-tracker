import { type FitItem } from "@api/database/entities/fit-analysis.entity";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";

import { FitItemType } from "./fit-item.type";

@ObjectType()
export class FitAnalysisType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  applicationId!: string | null;

  @Field(() => ID, { nullable: true })
  draftApplicationId!: string | null;

  @Field(() => ID)
  resumeId!: string;

  @Field(() => AsyncMetadataType, { nullable: true })
  generationMetadata?: AsyncMetadataType | null;

  @Field(() => Float, { nullable: true })
  scoreRatio!: number | null;

  @Field(() => String, { nullable: true })
  classification!: string | null;

  @Field(() => Int)
  fitCount!: number;

  @Field(() => Int)
  gapCount!: number;

  @Field(() => Int)
  unclearCount!: number;

  @Field(() => [FitItemType])
  items!: FitItem[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
