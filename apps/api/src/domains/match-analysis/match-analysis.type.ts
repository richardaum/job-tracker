import { type MatchItem } from "@api/database/entities/match-analysis.entity";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";

import { MatchItemType } from "./match-item.type";

@ObjectType()
export class MatchAnalysisType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  jobId!: string | null;

  @Field(() => ID, { nullable: true })
  draftJobId!: string | null;

  @Field(() => ID)
  resumeId!: string;

  @Field(() => AsyncMetadataType, { nullable: true })
  generationMetadata?: AsyncMetadataType | null;

  @Field(() => Float, { nullable: true })
  scoreRatio!: number | null;

  @Field(() => String, { nullable: true })
  classification!: string | null;

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
