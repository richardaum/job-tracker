import { registerEnumType } from "@nestjs/graphql";

export enum MatchVerdictEnum {
  Fit = "Fit",
  Gap = "Gap",
  Unclear = "Unclear",
}

registerEnumType(MatchVerdictEnum, { name: "MatchVerdict" });
