import { registerEnumType } from "@nestjs/graphql";

export enum SourceRunEventTypeEnum {
  SOURCE_RUN_CREATED = "source_run_created",
}

registerEnumType(SourceRunEventTypeEnum, { name: "SourceRunEventType" });
