import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationStageEnum {
  NEW = "NEW",
  APPLIED = "APPLIED",
  RECRUITER_SCREEN = "RECRUITER_SCREEN",
  TECHNICAL = "TECHNICAL",
  CULTURAL_FIT = "CULTURAL_FIT",
  OFFER = "OFFER",
  REJECTED = "REJECTED",
  DUPLICATED = "DUPLICATED",
}

registerEnumType(ApplicationStageEnum, { name: "JobStage" });
