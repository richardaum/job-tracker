import {
  MatchItem,
  RequirementTypeEnum,
} from "@api/database/entities/match-analysis.entity";
import { MatchSourceEnum } from "@api/domains/match-analysis/match-source.enum";
import { MatchVerdictEnum } from "@api/domains/match-analysis/match-verdict.enum";
import { WeightEnum } from "@api/domains/work-preferences/weight.enum";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export type MatchItemTypeRepresentation = MatchItem;

registerEnumType(RequirementTypeEnum, { name: "RequirementType" });

@ObjectType()
export class MatchItemType {
  @Field()
  requirement!: string;

  @Field(() => MatchSourceEnum)
  source!: MatchSourceEnum;

  @Field(() => WeightEnum, { nullable: true })
  weight?: WeightEnum;

  @Field(() => RequirementTypeEnum)
  type!: RequirementTypeEnum;

  @Field(() => MatchVerdictEnum)
  verdict!: MatchVerdictEnum;

  @Field()
  jdQuote!: string;

  @Field(() => [String])
  sourceQuotes!: string[];

  @Field({ nullable: true })
  suggestion?: string;
}
