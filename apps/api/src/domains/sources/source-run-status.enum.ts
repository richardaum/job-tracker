import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunStatusEnum {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

registerEnumType(SourceRunStatusEnum, { name: "SourceRunStatus" });
