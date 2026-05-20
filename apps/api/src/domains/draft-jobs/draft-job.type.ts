import { DraftJobConversionStatusEnum } from "@api/database/entities/draft-job.entity";
import { MatchAnalysisType } from "@api/domains/match-analysis/match-analysis.type";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";

registerEnumType(DraftJobConversionStatusEnum, {
  name: "DraftJobConversionStatus",
});

@ObjectType()
export class ConversionMetadataType {
  @Field(() => DraftJobConversionStatusEnum, { nullable: true })
  status?: DraftJobConversionStatusEnum | null;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => Date, { nullable: true })
  timestamp?: Date | null;
}

@ObjectType()
export class DraftJobType {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field()
  title!: string;

  @Field()
  htmlContent!: string;

  @Field(() => String, { nullable: true })
  jobId!: string | null;

  @Field(() => ConversionMetadataType, { nullable: true })
  conversionMetadata?: ConversionMetadataType | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => MatchAnalysisType, { nullable: true })
  match?: MatchAnalysisType;
}
