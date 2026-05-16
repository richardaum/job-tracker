import { DraftApplicationConversionStatusEnum } from "@api/database/entities/draft-application.entity";
import { FitAnalysisType } from "@api/domains/fit-analysis/fit-analysis.type";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";

registerEnumType(DraftApplicationConversionStatusEnum, {
  name: "DraftApplicationConversionStatus",
});

@ObjectType()
export class ConversionMetadataType {
  @Field(() => DraftApplicationConversionStatusEnum)
  status!: DraftApplicationConversionStatusEnum;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => String, { nullable: true })
  timestamp?: string | null;
}

@ObjectType()
export class DraftApplicationType {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field()
  title!: string;

  @Field()
  htmlContent!: string;

  @Field(() => String, { nullable: true })
  applicationId!: string | null;

  @Field(() => ConversionMetadataType, { nullable: true })
  conversionMetadata?: ConversionMetadataType | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => FitAnalysisType, { nullable: true })
  fit?: FitAnalysisType;
}
