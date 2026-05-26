import { registerEnumType } from "@nestjs/graphql";

export enum ExtensionActivityEventTypeEnum {
  SourceRunReceived = "SOURCE_RUN_RECEIVED",
  SourceRunClaimSkipped = "SOURCE_RUN_CLAIM_SKIPPED",
  SourceRunStarted = "SOURCE_RUN_STARTED",
  SourceRunJobImported = "SOURCE_RUN_JOB_IMPORTED",
  SourceRunCompleted = "SOURCE_RUN_COMPLETED",
  SourceRunFailed = "SOURCE_RUN_FAILED",
  ImportJobStarted = "IMPORT_JOB_STARTED",
  ImportJobCompleted = "IMPORT_JOB_COMPLETED",
  ImportJobFailed = "IMPORT_JOB_FAILED",
  AuthRefreshed = "AUTH_REFRESHED",
  AuthFailed = "AUTH_FAILED",
}

registerEnumType(ExtensionActivityEventTypeEnum, {
  name: "ExtensionActivityEventType",
});
