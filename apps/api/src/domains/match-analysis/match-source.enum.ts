import { registerEnumType } from "@nestjs/graphql";

export enum MatchSourceEnum {
  Resume = "Resume",
  Preference = "Preference",
}

registerEnumType(MatchSourceEnum, { name: "MatchSource" });
