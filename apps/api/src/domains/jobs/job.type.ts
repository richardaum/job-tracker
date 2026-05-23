import { CompanyType } from "@api/domains/companies/company.type";
import { MatchAnalysisType } from "@api/domains/match-analysis/match-analysis.type";
import { AsyncMetadataType } from "@api/domains/shared/async-metadata.type";
import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ApplicationSourceEnum } from "./job-source.enum";
import { ApplicationStageEnum } from "./job-stage.enum";

@ObjectType()
export class JobType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field(() => String, { nullable: true })
  title!: string | null;

  @Field(() => ID, { nullable: true })
  companyId!: string | null;

  @Field(() => CompanyType, { nullable: true })
  company?: CompanyType | null;

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

  @Field(() => String, { nullable: true })
  htmlContent!: string | null;

  /** Latest pipeline stage, derived from the most recent stage event. */
  @Field(() => ApplicationStageEnum)
  currentStage!: ApplicationStageEnum;

  /** Optional note on the most recent status transition. */
  @Field(() => String, { nullable: true })
  currentStageReason!: string | null;

  /**
   * Display date for current status: `COALESCE(latestEvent.scheduledAt, latestEvent.createdAt)`,
   * or `createdAt` when the job has no events.
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

  @Field(() => AsyncMetadataType, { nullable: true })
  fillMetadata?: AsyncMetadataType | null;

  @Field(() => MatchAnalysisType, { nullable: true })
  match?: MatchAnalysisType;
}
