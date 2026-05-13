import { DraftApplicationConversionStatus } from "@api/database/entities/draft-application.entity";
import { FitAnalysisType } from "@api/domains/fit-analysis/fit-analysis.type";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";

registerEnumType(DraftApplicationConversionStatus, {
  name: "DraftApplicationConversionStatus",
});

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

  @Field(() => DraftApplicationConversionStatus)
  conversionStatus!: DraftApplicationConversionStatus;

  @Field(() => String, { nullable: true })
  conversionError!: string | null;

  @Field(() => Date, { nullable: true })
  convertedAt!: Date | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => FitAnalysisType, { nullable: true })
  fit?: FitAnalysisType;
}
