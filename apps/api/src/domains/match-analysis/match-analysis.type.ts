import { type MatchItem } from "@api/database/entities/match-analysis.entity";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";

import { FitClassificationEnum } from "./fit-classification.enum";
import { MatchItemType } from "./match-item.type";

@ObjectType()
export class MatchAnalysisType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  jobId!: string;

  @Field(() => ID)
  resumeId!: string;

  @Field(() => AsyncMetadataType, { nullable: true })
  generationMetadata?: AsyncMetadataType | null;

  @Field(() => Float, { nullable: true })
  scoreRatio!: number | null;

  @Field(() => FitClassificationEnum, { nullable: true })
  classification!: FitClassificationEnum | null;

  @Field(() => Int)
  matchCount!: number;

  @Field(() => Int)
  gapCount!: number;

  @Field(() => Int)
  unclearCount!: number;

  @Field(() => [MatchItemType])
  items!: MatchItem[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
