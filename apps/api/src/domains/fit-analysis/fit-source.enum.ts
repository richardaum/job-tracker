import { registerEnumType } from "@nestjs/graphql";

export enum FitSourceEnum {
  RESUME = "RESUME",
  PREFERENCE = "PREFERENCE",
}

registerEnumType(FitSourceEnum, { name: "FitSource" });
