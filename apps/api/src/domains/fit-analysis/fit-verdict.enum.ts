import { registerEnumType } from "@nestjs/graphql";

export enum FitVerdictEnum {
  FIT = "FIT",
  GAP = "GAP",
  UNCLEAR = "UNCLEAR",
}

registerEnumType(FitVerdictEnum, { name: "FitVerdict" });
