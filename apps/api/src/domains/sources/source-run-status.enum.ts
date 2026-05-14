import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunStatusEnum {
  RUNNING = "running",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(SourceRunStatusEnum, { name: "SourceRunStatus" });
