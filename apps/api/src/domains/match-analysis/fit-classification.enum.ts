import { registerEnumType } from "@nestjs/graphql";

export enum FitClassificationEnum {
  Positive = "Positive",
  Neutral = "Neutral",
  Negative = "Negative",
}

registerEnumType(FitClassificationEnum, { name: "FitClassification" });
