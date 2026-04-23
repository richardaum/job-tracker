import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationStageEnum {
  NEW = "new",
  APPLIED = "applied",
  RECRUITER_SCREEN = "recruiter_screen",
  TECHNICAL = "technical",
  OFFER = "offer",
  REJECTED = "rejected",
}

registerEnumType(ApplicationStageEnum, {
  name: "ApplicationStage",
});
