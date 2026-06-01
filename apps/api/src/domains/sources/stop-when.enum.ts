import { registerEnumType } from "@nestjs/graphql";

export enum StopWhenEnum {
  CatchUp = "CatchUp",
  FirstRunMaxPages = "FirstRunMaxPages",
  OlderThan = "OlderThan",
}

registerEnumType(StopWhenEnum, { name: "StopWhen" });
