import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunEventTypeEnum {
  SOURCE_RUN_CREATED = "SOURCE_RUN_CREATED",
  SOURCE_RUN_STATUS_CHANGED = "SOURCE_RUN_STATUS_CHANGED",
}

registerEnumType(SourceRunEventTypeEnum, { name: "SourceRunEventType" });
