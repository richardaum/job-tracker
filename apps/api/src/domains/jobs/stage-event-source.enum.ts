import { registerEnumType } from "@nestjs/graphql";

export enum StageEventSourceEnum {
  Manual = "Manual",
  System = "System",
}

registerEnumType(StageEventSourceEnum, { name: "StageEventSource" });
