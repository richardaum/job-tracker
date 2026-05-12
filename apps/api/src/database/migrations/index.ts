import { Baseline1746009600000 } from "./1746009600000-baseline";
import { AddApplicationSalaryColumns1747000000000 } from "./1747000000000-add-application-salary-columns";
import { RenameSalaryTagsToTags1748000000000 } from "./1748000000000-rename-salary-tags-to-tags";
import { CreateCompanies1749000000000 } from "./1749000000000-create-companies";
import { EnsureCompanyDescriptionTiptap1750000000000 } from "./1750000000000-ensure-company-description-tiptap";
import { AddStageEventReason1751000000000 } from "./1751000000000-add-stage-event-reason";
import { UseTimestamptzForStageEvents1752000000000 } from "./1752000000000-use-timestamptz-for-stage-events";
import { AddApplicationSource1753000000000 } from "./1753000000000-add-application-source";
import { CompaniesUserLowerNameUnique1754000000000 } from "./1754000000000-companies-user-lower-name-unique";
import { CreateImportRuns1755000000000 } from "./1755000000000-create-import-runs";
import { ImportRunStatusInProgress1755100000000 } from "./1755100000000-import-run-status-in-progress";
import { DropImportRunsExecutorPlanJson1755200000000 } from "./1755200000000-drop-import-runs-executor-plan-json";
import { AddApplicationUrls1756000000000 } from "./1756000000000-add-application-urls";
import { DropApplicationUrl1756000001000 } from "./1756000001000-drop-application-url";
import { CreateExchangeRateCache1757000000000 } from "./1757000000000-create-exchange-rate-cache";
import { CreateDraftApplications1758000000000 } from "./1758000000000-create-draft-applications";
import { AddTitleToDraftApplications1762440000000 } from "./1762440000000-add-title-to-draft-applications";
import { DraftAiGeneratedFieldsAndApplicationLink1763000000000 } from "./1763000000000-draft-ai-generated-fields-and-application-link";
import { DropDraftApplicationsAiGeneratedFields1763000000001 } from "./1763000000001-drop-draft-applications-ai-generated-fields";
import { AddDraftApplicationConversionStatus1763200000000 } from "./1763200000000-add-draft-application-conversion-status";
import { AddApplicationStageDuplicated1763300000000 } from "./1763300000000-add-application-stage-duplicated";
import { AddApplicationStageCulturalFit1763300001000 } from "./1763300001000-add-application-stage-cultural-fit";
import { AddApplicationSourceRemoteyeah1763400000000 } from "./1763400000000-add-application-source-remoteyeah";
import { BackfillApplicationSourceRemoteyeah1763400000001 } from "./1763400000001-backfill-application-source-remoteyeah";
import { DropImportRunsEntryUrl1763500000000 } from "./1763500000000-drop-import-runs-entry-url";
import { DropImportRunsImporterName1763600000000 } from "./1763600000000-drop-import-runs-importer-name";
import { MoveDraftApplicationFkToDraft1763700000000 } from "./1763700000000-move-draft-application-fk-to-draft-table";
import { ApplicationsDraftManyToOne1763800000000 } from "./1763800000000-applications-draft-many-to-one";
import { ImportTemplatesAndRunSurfaceUrl1763900000000 } from "./1763900000000-import-templates-and-run-surface-url";
import { ImportTemplateDefaultSurfaceUrl1763910000000 } from "./1763910000000-import-template-default-surface-url";
import { MakeSurfaceUrlMandatory1764000000000 } from "./1764000000000-make-surface-url-mandatory";
import { CreateResumes1764100000000 } from "./1764100000000-create-resumes";
import { CreateUserPreferences1764200000000 } from "./1764200000000-create-user-preferences";
import { MakeDraftApplicationUrlNullable1764300000000 } from "./1764300000000-make-draft-application-url-nullable";
import { CreateFitAnalysis1764400000000 } from "./1764400000000-create-fit-analysis";
import { AddFitAnalysisStatus1764500000000 } from "./1764500000000-add-fit-analysis-status";

export const migrations = [
  Baseline1746009600000,
  AddApplicationSalaryColumns1747000000000,
  RenameSalaryTagsToTags1748000000000,
  CreateCompanies1749000000000,
  EnsureCompanyDescriptionTiptap1750000000000,
  AddStageEventReason1751000000000,
  UseTimestamptzForStageEvents1752000000000,
  AddApplicationSource1753000000000,
  CompaniesUserLowerNameUnique1754000000000,
  CreateImportRuns1755000000000,
  ImportRunStatusInProgress1755100000000,
  DropImportRunsExecutorPlanJson1755200000000,
  AddApplicationUrls1756000000000,
  DropApplicationUrl1756000001000,
  CreateExchangeRateCache1757000000000,
  CreateDraftApplications1758000000000,
  AddTitleToDraftApplications1762440000000,
  DraftAiGeneratedFieldsAndApplicationLink1763000000000,
  DropDraftApplicationsAiGeneratedFields1763000000001,
  AddDraftApplicationConversionStatus1763200000000,
  AddApplicationStageDuplicated1763300000000,
  AddApplicationStageCulturalFit1763300001000,
  AddApplicationSourceRemoteyeah1763400000000,
  BackfillApplicationSourceRemoteyeah1763400000001,
  DropImportRunsEntryUrl1763500000000,
  DropImportRunsImporterName1763600000000,
  MoveDraftApplicationFkToDraft1763700000000,
  ApplicationsDraftManyToOne1763800000000,
  ImportTemplatesAndRunSurfaceUrl1763900000000,
  ImportTemplateDefaultSurfaceUrl1763910000000,
  MakeSurfaceUrlMandatory1764000000000,
  CreateResumes1764100000000,
  CreateUserPreferences1764200000000,
  MakeDraftApplicationUrlNullable1764300000000,
  CreateFitAnalysis1764400000000,
  AddFitAnalysisStatus1764500000000,
];
