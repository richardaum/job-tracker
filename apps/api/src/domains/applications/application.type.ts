import { CompanyType } from "@api/domains/companies/company.type";
import { FitAnalysisType } from "@api/domains/fit-analysis/fit-analysis.type";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ApplicationSourceEnum } from "./application-source.enum";
import { ApplicationStageEnum } from "./application-stage.enum";

@ObjectType()
export class ApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field(() => ID)
  companyId!: string;

  @Field(() => CompanyType)
  company!: CompanyType;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => [String])
  urls!: string[];

  @Field(() => ApplicationSourceEnum, { nullable: true })
  source!: ApplicationSourceEnum | null;

  @Field(() => [String])
  tags!: string[];

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field(() => String, { nullable: true })
  workRegion!: string | null;

  /** Latest pipeline stage, derived from the most recent stage event. */
  @Field(() => ApplicationStageEnum)
  currentStage!: ApplicationStageEnum;

  /** Optional note on the most recent status transition. */
  @Field(() => String, { nullable: true })
  currentStageReason!: string | null;

  /**
   * Display date for current status: `COALESCE(latestEvent.scheduledAt, latestEvent.createdAt)`,
   * or `createdAt` when the application has no events.
   */
  @Field()
  currentStageAt!: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => ID, { nullable: true })
  sourceRunId!: string | null;

  @Field(() => String, { nullable: true })
  summary!: string | null;

  @Field(() => AsyncMetadataType, { nullable: true })
  summaryMetadata?: AsyncMetadataType | null;

  @Field(() => FitAnalysisType, { nullable: true })
  fit?: FitAnalysisType;
}
