import {
  FitItem,
  RequirementTypeEnum,
} from "@api/database/entities/fit-analysis.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export type FitItemTypeRepresentation = FitItem;

registerEnumType(RequirementTypeEnum, { name: "RequirementType" });

@ObjectType()
export class FitItemType {
  @Field()
  requirement!: string;

  @Field()
  source!: string;

  @Field({ nullable: true })
  weight?: "high" | "low";

  @Field(() => String)
  type!: RequirementTypeEnum;

  @Field()
  verdict!: "fit" | "gap" | "unclear";

  @Field()
  jdQuote!: string;

  @Field(() => [String])
  sourceQuotes!: string[];

  @Field({ nullable: true })
  suggestion?: string;
}
