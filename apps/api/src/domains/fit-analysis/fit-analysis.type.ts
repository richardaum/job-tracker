import {
  FitAnalysisStatus,
  type FitItem,
} from "@api/database/entities/fit-analysis.entity";
import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

import { FitItemType } from "./fit-item.type";

registerEnumType(FitAnalysisStatus, { name: "FitAnalysisStatus" });

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

  @Field(() => FitAnalysisStatus)
  status!: FitAnalysisStatus;

  @Field(() => String, { nullable: true })
  error!: string | null;

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
