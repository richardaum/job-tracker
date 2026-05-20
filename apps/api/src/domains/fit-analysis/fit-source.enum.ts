import { registerEnumType } from "@nestjs/graphql";

export enum FitSourceEnum {
  Resume = "Resume",
  Preference = "Preference",
}

registerEnumType(FitSourceEnum, { name: "FitSource" });
