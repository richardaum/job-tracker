import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunEventTypeEnum {
  SourceRunCreated = "SourceRunCreated",
  SourceRunStatusChanged = "SourceRunStatusChanged",
}

registerEnumType(SourceRunEventTypeEnum, { name: "SourceRunEventType" });
