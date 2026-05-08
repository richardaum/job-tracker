import { registerEnumType } from "@nestjs/graphql";

export enum ImportRunEventTypeEnum {
  IMPORT_RUN_CREATED = "import_run_created",
}

registerEnumType(ImportRunEventTypeEnum, { name: "ImportRunEventType" });
