import {
  MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { FitSourceEnum } from "@api/domains/match-analysis/fit-source.enum";
import { FitVerdictEnum } from "@api/domains/match-analysis/fit-verdict.enum";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export type MatchItemTypeRepresentation = MatchItem;

registerEnumType(RequirementTypeEnum, { name: "RequirementType" });

@ObjectType()
export class MatchItemType {
  @Field()
  requirement!: string;

  @Field(() => FitSourceEnum)
  source!: FitSourceEnum;

  @Field({ nullable: true })
  weight?: "high" | "low";

  @Field(() => RequirementTypeEnum)
  type!: RequirementTypeEnum;

  @Field(() => FitVerdictEnum)
  verdict!: FitVerdictEnum;

  @Field()
  jdQuote!: string;

  @Field(() => [String])
  sourceQuotes!: string[];

  @Field({ nullable: true })
  suggestion?: string;
}
