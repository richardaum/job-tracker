import { registerEnumType } from "@nestjs/graphql";

export enum ExtensionActivityEventTypeEnum {
  SourceRunReceived = "SourceRunReceived",
  SourceRunClaimSkipped = "SourceRunClaimSkipped",
  SourceRunStarted = "SourceRunStarted",
  SourceRunPageCollected = "SourceRunPageCollected",
  SourceRunStopConditionMet = "SourceRunStopConditionMet",
  SourceRunJobSurfaceImport = "SourceRunJobSurfaceImport",
  SourceRunJobDetailsImport = "SourceRunJobDetailsImport",
  SourceRunJobSkipped = "SourceRunJobSkipped",
  SourceRunCompleted = "SourceRunCompleted",
  SourceRunFailed = "SourceRunFailed",
  ImportJobStarted = "ImportJobStarted",
  ImportJobCompleted = "ImportJobCompleted",
  ImportJobFailed = "ImportJobFailed",
  AuthRefreshed = "AuthRefreshed",
  AuthFailed = "AuthFailed",
}

registerEnumType(ExtensionActivityEventTypeEnum, { name: "ExtensionActivityEventType" });
