import { SquashedBaseline1767000000000 } from "./1767000000000-baseline";
import { AddSummaryMetadataJsonb1767100000000 } from "./1767100000000-add-summary-metadata-jsonb";
import { NormalizeEnumValuesUppercase1767200000000 } from "./1767200000000-normalize-enum-values-uppercase";
import { RenameGeneratedAtToTimestamp1767300000000 } from "./1767300000000-rename-generated-at-to-timestamp";
import { AddFitAnalysisGenerationMetadata1767400000000 } from "./1767400000000-add-fit-analysis-generation-metadata";
import { AddConversionMetadataJsonb1767500000000 } from "./1767500000000-add-conversion-metadata-jsonb";
import { RenameUserPreferencesToWorkPreferences1767600000000 } from "./1767600000000-rename-user-preferences-to-work-preferences";
import { MigrateDraftConversionJsonbToEmbedded1767700000000 } from "./1767700000000-migrate-draft-conversion-jsonb-to-embedded";
import { MigrateApplicationSummaryJsonbToEmbedded1767800000000 } from "./1767800000000-migrate-application-summary-jsonb-to-embedded";
import { MigrateFitAnalysisGenerationJsonbToEmbedded1767900000000 } from "./1767900000000-migrate-fit-analysis-generation-jsonb-to-embedded";
import { RenameEmbeddedColumnsToSnakeCase1768000000000 } from "./1768000000000-rename-embedded-columns-to-snake-case";

export const migrations = [
  SquashedBaseline1767000000000,
  AddSummaryMetadataJsonb1767100000000,
  NormalizeEnumValuesUppercase1767200000000,
  RenameGeneratedAtToTimestamp1767300000000,
  AddFitAnalysisGenerationMetadata1767400000000,
  AddConversionMetadataJsonb1767500000000,
  RenameUserPreferencesToWorkPreferences1767600000000,
  MigrateDraftConversionJsonbToEmbedded1767700000000,
  MigrateApplicationSummaryJsonbToEmbedded1767800000000,
  MigrateFitAnalysisGenerationJsonbToEmbedded1767900000000,
  RenameEmbeddedColumnsToSnakeCase1768000000000,
];
