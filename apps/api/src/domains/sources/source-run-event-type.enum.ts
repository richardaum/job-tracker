import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunEventTypeEnum {
  SOURCE_RUN_CREATED = "SOURCE_RUN_CREATED",
}

registerEnumType(SourceRunEventTypeEnum, { name: "SourceRunEventType" });
