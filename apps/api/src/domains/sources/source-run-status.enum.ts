import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunStatusEnum {
  RUNNING = "RUNNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

registerEnumType(SourceRunStatusEnum, { name: "SourceRunStatus" });
