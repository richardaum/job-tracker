import {
  FitItem,
  RequirementTypeEnum,
} from "@api/database/entities/fit-analysis.entity";
import { FitSourceEnum } from "@api/domains/fit-analysis/fit-source.enum";
import { FitVerdictEnum } from "@api/domains/fit-analysis/fit-verdict.enum";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export type FitItemTypeRepresentation = FitItem;

registerEnumType(RequirementTypeEnum, { name: "RequirementType" });

@ObjectType()
export class FitItemType {
  @Field()
  requirement!: string;

  @Field(() => FitSourceEnum)
  source!: FitSourceEnum;

  @Field({ nullable: true })
  weight?: "high" | "low";

  @Field(() => String)
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
