import { registerEnumType } from "@nestjs/graphql";

export enum FitVerdictEnum {
  Fit = "Fit",
  Gap = "Gap",
  Unclear = "Unclear",
}

registerEnumType(FitVerdictEnum, { name: "FitVerdict" });
