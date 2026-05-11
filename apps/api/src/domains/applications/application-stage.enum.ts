import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationStageEnum {
  NEW = "new",
  APPLIED = "applied",
  RECRUITER_SCREEN = "recruiter_screen",
  TECHNICAL = "technical",
  CULTURAL_FIT = "cultural_fit",
  OFFER = "offer",
  REJECTED = "rejected",
  DUPLICATED = "duplicated",
}

registerEnumType(ApplicationStageEnum, { name: "ApplicationStage" });
