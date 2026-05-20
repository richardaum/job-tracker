import { registerEnumType } from "@nestjs/graphql";

export enum StageEventSourceEnum {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
}

registerEnumType(StageEventSourceEnum, { name: "StageEventSource" });
