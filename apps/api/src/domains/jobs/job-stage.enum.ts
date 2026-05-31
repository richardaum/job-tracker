import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationStageEnum {
  Draft = "Draft",
  New = "New",
  Applied = "Applied",
  RecruiterScreen = "RecruiterScreen",
  Technical = "Technical",
  CulturalFit = "CulturalFit",
  Offer = "Offer",
  Rejected = "Rejected",
  Duplicated = "Duplicated",
}

registerEnumType(ApplicationStageEnum, { name: "ApplicationStage" });
