import { registerEnumType } from "@nestjs/graphql";

export enum FitClassificationEnum {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  NEGATIVE = "NEGATIVE",
}

registerEnumType(FitClassificationEnum, { name: "FitClassification" });
