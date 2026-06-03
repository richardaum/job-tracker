import { SquashedBaseline1767000000000 } from "./1767000000000-baseline";
import { AddSummaryMetadataJsonb1767100000000 } from "./1767100000000-add-summary-metadata-jsonb";
import { NormalizeEnumValuesUppercase1767200000000 } from "./1767200000000-normalize-enum-values-uppercase";
import { RenameGeneratedAtToTimestamp1767300000000 } from "./1767300000000-rename-generated-at-to-timestamp";
import { AddFitAnalysisGenerationMetadata1767400000000 } from "./1767400000000-add-match-analysis-generation-metadata";
import { AddConversionMetadataJsonb1767500000000 } from "./1767500000000-add-conversion-metadata-jsonb";
import { RenameUserPreferencesToWorkPreferences1767600000000 } from "./1767600000000-rename-user-preferences-to-work-preferences";
import { RenameApplicationToJob1767700000000 } from "./1767700000000-rename-application-to-job";
import { MigrateDraftConversionJsonbToEmbedded1767710000000 } from "./1767710000000-migrate-draft-conversion-jsonb-to-embedded";
import { MigrateApplicationSummaryJsonbToEmbedded1767720000000 } from "./1767720000000-migrate-application-summary-jsonb-to-embedded";
import { MigrateFitAnalysisGenerationJsonbToEmbedded1767730000000 } from "./1767730000000-migrate-fit-analysis-generation-jsonb-to-embedded";
import { RenameEmbeddedColumnsToSnakeCase1767740000000 } from "./1767740000000-rename-embedded-columns-to-snake-case";
import { AddStageEventSourceEnum1767750000000 } from "./1767750000000-add-stage-event-source-enum";
import { AddFitClassificationEnum1767760000000 } from "./1767760000000-add-fit-classification-enum";
import { UseTimestamptzForJobNotes1767770000000 } from "./1767770000000-use-timestamptz-for-job-notes";
import { UseTimestamptzForRemainingEntities1767780000000 } from "./1767780000000-use-timestamptz-for-remaining-entities";
import { IntegrateDraftIntoJobs1767800000000 } from "./1767800000000-integrate-draft-into-jobs";
import { NullableJobCompanyId1767850000000 } from "./1767850000000-nullable-job-company-id";
import { RemoveDraftPendingPlaceholderCompanies1767860000000 } from "./1767860000000-remove-draft-pending-placeholder-companies";
import { UserSettings1767900000000 } from "./1767900000000-user-settings";
import { AddUserActiveTokenVersion1767910000000 } from "./1767910000000-add-user-active-token-version";
import { AddUserRefreshJti1767920000000 } from "./1767920000000-add-user-refresh-jti";
import { UserAuthProvider1767950000000 } from "./1767950000000-user-auth-provider";
import { UserAccounts1767960000000 } from "./1767960000000-user-accounts";
import { AddAutoMatchEnabled1767970000000 } from "./1767970000000-add-auto-match-enabled";
import { ExtensionActivityEvents1767970000000 } from "./1767970000000-extension-activity-events";
import { ChangePayloadToJsonb1767980000000 } from "./1767980000000-change-payload-to-jsonb";
import { AddAdminRoleEnum1767990000000 } from "./1767990000000-add-admin-role-enum";
import { AddKeywordBlockerColumns1768000000000 } from "./1768000000000-add-keyword-blocker-columns";
import { CreatePlansTable1768010000000 } from "./1768010000000-create-plans-table";
import { MergeSourceProfileIntoPlan1768050000000 } from "./1768050000000-merge-source-profile-into-plan";
import { NormalizeSourceRunStatusPascalcase1768060000000 } from "./1768060000000-normalize-source-run-status-pascalcase";
import { AddSourceRunErrorMessage1768070000000 } from "./1768070000000-add-source-run-error-message";
import { DropPlanSourceProfileId1768080000000 } from "./1768080000000-drop-plan-source-profile-id";
import { AddSourceTemplateConfigJsonb1768090000000 } from "./1768090000000-add-source-template-config-jsonb";
import { NormalizeStopwhenToArray1768100000000 } from "./1768100000000-normalize-stopwhen-to-array";
import { AddJobPublishedAt1768110000000 } from "./1768110000000-add-job-published-at";
import { AddPlanUserId1768120000000 } from "./1768120000000-add-plan-user-id";
import { NormalizeExtensionActivityEventTypePascalCase1768130000000 } from "./1768130000000-normalize-extension-activity-event-type-pascalcase";
import { NormalizeRoleEnumPascalcase1768140000000 } from "./1768140000000-normalize-role-enum-pascalcase";
import { AddSourceRunJobSkipped1768150000000 } from "./1768150000000-add-source-run-job-skipped";
import { NormalizeEnumValuesPascalcase1768160000000 } from "./1768160000000-normalize-enum-values-pascalcase";
import { RenameCorrelationIdToSourceRunId1768170000000 } from "./1768170000000-rename-correlation-id-to-source-run-id";
import { CreateAiConversationsAndMessages1768180000000 } from "./1768180000000-create-ai-conversations-and-messages";
import { AddSourceRunJobSurfaceAndDetailsImport1780272917000 } from "./1780272917000-add-source-run-job-surface-and-details-import";
import { ChangeAiMessageRoleToEnum1780272918000 } from "./1780272918000-change-ai-message-role-to-enum";

export const migrations = [
  SquashedBaseline1767000000000,
  AddSummaryMetadataJsonb1767100000000,
  NormalizeEnumValuesUppercase1767200000000,
  RenameGeneratedAtToTimestamp1767300000000,
  AddFitAnalysisGenerationMetadata1767400000000,
  AddConversionMetadataJsonb1767500000000,
  RenameUserPreferencesToWorkPreferences1767600000000,
  RenameApplicationToJob1767700000000,
  MigrateDraftConversionJsonbToEmbedded1767710000000,
  MigrateApplicationSummaryJsonbToEmbedded1767720000000,
  MigrateFitAnalysisGenerationJsonbToEmbedded1767730000000,
  RenameEmbeddedColumnsToSnakeCase1767740000000,
  AddStageEventSourceEnum1767750000000,
  AddFitClassificationEnum1767760000000,
  UseTimestamptzForJobNotes1767770000000,
  UseTimestamptzForRemainingEntities1767780000000,
  IntegrateDraftIntoJobs1767800000000,
  NullableJobCompanyId1767850000000,
  RemoveDraftPendingPlaceholderCompanies1767860000000,
  UserSettings1767900000000,
  AddUserActiveTokenVersion1767910000000,
  AddUserRefreshJti1767920000000,
  UserAuthProvider1767950000000,
  UserAccounts1767960000000,
  AddAutoMatchEnabled1767970000000,
  ExtensionActivityEvents1767970000000,
  ChangePayloadToJsonb1767980000000,
  AddAdminRoleEnum1767990000000,
  AddKeywordBlockerColumns1768000000000,
  CreatePlansTable1768010000000,
  MergeSourceProfileIntoPlan1768050000000,
  NormalizeSourceRunStatusPascalcase1768060000000,
  AddSourceRunErrorMessage1768070000000,
  DropPlanSourceProfileId1768080000000,
  AddSourceTemplateConfigJsonb1768090000000,
  NormalizeStopwhenToArray1768100000000,
  AddJobPublishedAt1768110000000,
  AddPlanUserId1768120000000,
  NormalizeExtensionActivityEventTypePascalCase1768130000000,
  NormalizeRoleEnumPascalcase1768140000000,
  AddSourceRunJobSkipped1768150000000,
  NormalizeEnumValuesPascalcase1768160000000,
  RenameCorrelationIdToSourceRunId1768170000000,
  CreateAiConversationsAndMessages1768180000000,
  AddSourceRunJobSurfaceAndDetailsImport1780272917000,
  ChangeAiMessageRoleToEnum1780272918000,
];
