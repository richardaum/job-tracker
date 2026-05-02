import { registerEnumType } from "@nestjs/graphql";

export enum ImportRunStatusEnum {
  RUNNING = "running",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(ImportRunStatusEnum, { name: "ImportRunStatus" });
