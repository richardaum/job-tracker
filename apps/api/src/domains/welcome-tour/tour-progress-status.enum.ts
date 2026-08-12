import { registerEnumType } from "@nestjs/graphql";

export enum TourProgressStatusEnum {
  InProgress = "InProgress",
  Completed = "Completed",
  Skipped = "Skipped",
}

registerEnumType(TourProgressStatusEnum, { name: "TourProgressStatus" });
