import type { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
};

export enum ApplicationQuickFilter {
  Active = "ACTIVE",
  Applied = "APPLIED",
  Duplicated = "DUPLICATED",
  Incoming = "INCOMING",
  New = "NEW",
}

export type ApplicationSalary = {
  __typename?: "ApplicationSalary";
  currency?: Maybe<Scalars["String"]["output"]>;
  maxCents?: Maybe<Scalars["Int"]["output"]>;
  minCents?: Maybe<Scalars["Int"]["output"]>;
  period?: Maybe<SalaryPeriod>;
};

export enum ApplicationSource {
  Jack = "JACK",
  Linkedin = "LINKEDIN",
  RemoteYeah = "REMOTE_YEAH",
  Wellfound = "WELLFOUND",
}

export enum ApplicationStage {
  Applied = "APPLIED",
  CulturalFit = "CULTURAL_FIT",
  Duplicated = "DUPLICATED",
  New = "NEW",
  Offer = "OFFER",
  RecruiterScreen = "RECRUITER_SCREEN",
  Rejected = "REJECTED",
  Technical = "TECHNICAL",
}

export type ApplicationStageEventType = {
  __typename?: "ApplicationStageEventType";
  applicationId: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  fromStage?: Maybe<ApplicationStage>;
  id: Scalars["ID"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  scheduledAt?: Maybe<Scalars["DateTime"]["output"]>;
  source: Scalars["String"]["output"];
  toStage: ApplicationStage;
  userId: Scalars["String"]["output"];
};

export type ApplicationType = {
  __typename?: "ApplicationType";
  company: CompanyType;
  companyId: Scalars["ID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  currentStage: ApplicationStage;
  currentStageAt: Scalars["DateTime"]["output"];
  currentStageReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  fit?: Maybe<FitAnalysisType>;
  id: Scalars["ID"]["output"];
  importRunId?: Maybe<Scalars["ID"]["output"]>;
  salary: ApplicationSalary;
  source?: Maybe<ApplicationSource>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  urls: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
};

export type CompanyType = {
  __typename?: "CompanyType";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type CreateApplicationInput = {
  company: Scalars["String"]["input"];
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  importRunId?: InputMaybe<Scalars["ID"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type CreateApplicationStageEventInput = {
  applicationId: Scalars["String"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  toStage: ApplicationStage;
};

export type CreateDraftApplicationInput = {
  htmlContent: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateImportRunInput = { importerId: Scalars["String"]["input"] };

export type CreateImportTemplateInput = {
  importerId: Scalars["String"]["input"];
  surfaceUrl: Scalars["String"]["input"];
};

export type CreateNoteInput = {
  applicationId: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
};

export type CreateResumeInput = {
  content: Scalars["String"]["input"];
  isDefault?: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
};

export type CurrencyRates = {
  __typename?: "CurrencyRates";
  base: Scalars["String"]["output"];
  rates: Array<ExchangeRate>;
};

export type DeleteMutationPayloadType = {
  __typename?: "DeleteMutationPayloadType";
  deletedId: Scalars["ID"]["output"];
  success: Scalars["Boolean"]["output"];
};

export enum DraftApplicationConversionStatus {
  Failed = "FAILED",
  Idle = "IDLE",
  Processing = "PROCESSING",
  Succeeded = "SUCCEEDED",
}

export type DraftApplicationType = {
  __typename?: "DraftApplicationType";
  applicationId?: Maybe<Scalars["String"]["output"]>;
  conversionError?: Maybe<Scalars["String"]["output"]>;
  conversionStatus: DraftApplicationConversionStatus;
  convertedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  htmlContent: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
};

export type ExchangeRate = {
  __typename?: "ExchangeRate";
  currency: Scalars["String"]["output"];
  rate: Scalars["Float"]["output"];
};

export enum FitAnalysisStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Processing = "PROCESSING",
}

export type FitAnalysisType = {
  __typename?: "FitAnalysisType";
  applicationId: Scalars["ID"]["output"];
  classification?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  error?: Maybe<Scalars["String"]["output"]>;
  fitCount: Scalars["Int"]["output"];
  gapCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  items: Array<FitItemType>;
  resumeId: Scalars["ID"]["output"];
  scoreRatio?: Maybe<Scalars["Float"]["output"]>;
  status: FitAnalysisStatus;
  unclearCount: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type FitItemType = {
  __typename?: "FitItemType";
  jdQuote: Scalars["String"]["output"];
  requirement: Scalars["String"]["output"];
  source: Scalars["String"]["output"];
  sourceQuotes: Array<Scalars["String"]["output"]>;
  suggestion?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  verdict: Scalars["String"]["output"];
  weight?: Maybe<Scalars["String"]["output"]>;
};

export type GenerateFitInput = {
  applicationId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export type ImportRunEvent = {
  __typename?: "ImportRunEvent";
  occurredAt: Scalars["DateTime"]["output"];
  run: ImportRunType;
  type: ImportRunEventType;
};

export enum ImportRunEventType {
  ImportRunCreated = "IMPORT_RUN_CREATED",
}

export enum ImportRunStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Running = "RUNNING",
}

export type ImportRunType = {
  __typename?: "ImportRunType";
  id: Scalars["ID"]["output"];
  importerId: Scalars["String"]["output"];
  importerSource: Scalars["String"]["output"];
  startedAt: Scalars["DateTime"]["output"];
  status: ImportRunStatus;
  surfaceUrl: Scalars["String"]["output"];
  templateId: Scalars["ID"]["output"];
};

export type ImportTemplateType = {
  __typename?: "ImportTemplateType";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  importerId: Scalars["String"]["output"];
  runs: Array<ImportRunType>;
  scheduleCron?: Maybe<Scalars["String"]["output"]>;
  scheduleEnabled: Scalars["Boolean"]["output"];
  surfaceUrl: Scalars["String"]["output"];
};

export type ImporterDescriptorType = {
  __typename?: "ImporterDescriptorType";
  importerId: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  templates: Array<ImportTemplateType>;
};

export type Mutation = {
  __typename?: "Mutation";
  claimImportRun?: Maybe<ImportRunType>;
  clearImportRuns: Scalars["Boolean"]["output"];
  createApplication: ApplicationType;
  createApplicationNote: NoteType;
  createApplicationStageEvent: ApplicationStageEventType;
  createApplicationWithAIV2: DraftApplicationType;
  createDraftApplication: DraftApplicationType;
  createImportRun: ImportRunType;
  createImportTemplate: ImportTemplateType;
  createResume: ResumeType;
  deleteApplication: DeleteMutationPayloadType;
  deleteApplicationNote: DeleteMutationPayloadType;
  deleteApplicationStageEvent: DeleteMutationPayloadType;
  deleteApplicationsForDraft: DeleteMutationPayloadType;
  deleteCompany: DeleteMutationPayloadType;
  deleteDraftApplication: DeleteMutationPayloadType;
  deleteImportRun: DeleteMutationPayloadType;
  deleteImportTemplate: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  detachApplicationsFromImportRun: Scalars["Int"]["output"];
  generateApplicationFit: FitAnalysisType;
  removeApplicationTag: ApplicationType;
  rerunImportTemplate: ImportRunType;
  updateApplication: ApplicationType;
  updateApplicationNote: NoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
  updateCompany: CompanyType;
  updateDraftApplication: DraftApplicationType;
  updateImportRun: ImportRunType;
  updateImportRunStatus: ImportRunType;
  updateImportTemplate: ImportTemplateType;
  updateResume: ResumeType;
  updateUserPreferences: Array<PreferenceType>;
};

export type MutationClaimImportRunArgs = { id: Scalars["ID"]["input"] };

export type MutationCreateApplicationArgs = { input: CreateApplicationInput };

export type MutationCreateApplicationNoteArgs = { input: CreateNoteInput };

export type MutationCreateApplicationStageEventArgs = {
  input: CreateApplicationStageEventInput;
};

export type MutationCreateApplicationWithAiv2Args = {
  draftId: Scalars["ID"]["input"];
};

export type MutationCreateDraftApplicationArgs = {
  input: CreateDraftApplicationInput;
};

export type MutationCreateImportRunArgs = { input: CreateImportRunInput };

export type MutationCreateImportTemplateArgs = {
  input: CreateImportTemplateInput;
};

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationDeleteApplicationArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteApplicationNoteArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteApplicationStageEventArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteApplicationsForDraftArgs = {
  draftId: Scalars["ID"]["input"];
};

export type MutationDeleteCompanyArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteDraftApplicationArgs = {
  deleteLinkedApplication?: InputMaybe<Scalars["Boolean"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteImportRunArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteImportTemplateArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteResumeArgs = { id: Scalars["ID"]["input"] };

export type MutationDetachApplicationsFromImportRunArgs = {
  importRunId: Scalars["ID"]["input"];
};

export type MutationGenerateApplicationFitArgs = { input: GenerateFitInput };

export type MutationRemoveApplicationTagArgs = {
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
};

export type MutationRerunImportTemplateArgs = {
  templateId: Scalars["ID"]["input"];
};

export type MutationUpdateApplicationArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApplicationInput;
};

export type MutationUpdateApplicationNoteArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateNoteInput;
};

export type MutationUpdateApplicationStageEventArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApplicationStageEventInput;
};

export type MutationUpdateCompanyArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateCompanyInput;
};

export type MutationUpdateDraftApplicationArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateDraftApplicationInput;
};

export type MutationUpdateImportRunArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateImportRunInput;
};

export type MutationUpdateImportRunStatusArgs = {
  id: Scalars["ID"]["input"];
  status: ImportRunStatus;
};

export type MutationUpdateImportTemplateArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateImportTemplateInput;
};

export type MutationUpdateResumeArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateResumeInput;
};

export type MutationUpdateUserPreferencesArgs = {
  items: Array<PreferenceInput>;
};

export type NoteType = {
  __typename?: "NoteType";
  applicationId?: Maybe<Scalars["String"]["output"]>;
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  revision: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type PreferenceInput = {
  text: Scalars["String"]["input"];
  weight: WeightEnum;
};

export type PreferenceType = {
  __typename?: "PreferenceType";
  text: Scalars["String"]["output"];
  weight: WeightEnum;
};

export type Query = {
  __typename?: "Query";
  application: ApplicationType;
  applicationFit?: Maybe<FitAnalysisType>;
  applicationNotes: Array<NoteType>;
  applicationStageEvents: Array<ApplicationStageEventType>;
  applications: Array<ApplicationType>;
  companies: Array<CompanyType>;
  companyApplicationsCount: Scalars["Int"]["output"];
  draftApplication: DraftApplicationType;
  draftApplications: Array<DraftApplicationType>;
  exchangeRates: CurrencyRates;
  generateApplicationNoteWithAI: Scalars["String"]["output"];
  generateCompanyDescription: Scalars["String"]["output"];
  importRuns: Array<ImportRunType>;
  importTemplates: Array<ImportTemplateType>;
  importTemplatesForImporter: Array<ImportTemplateType>;
  importers: Array<ImporterDescriptorType>;
  me: UserType;
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars["String"]["output"];
  userPreferences: Array<PreferenceType>;
};

export type QueryApplicationArgs = { id: Scalars["ID"]["input"] };

export type QueryApplicationFitArgs = { applicationId: Scalars["ID"]["input"] };

export type QueryApplicationNotesArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryApplicationStageEventsArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryApplicationsArgs = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<ApplicationQuickFilter>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryCompanyApplicationsCountArgs = { id: Scalars["ID"]["input"] };

export type QueryDraftApplicationArgs = { id: Scalars["ID"]["input"] };

export type QueryExchangeRatesArgs = {
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]>;
};

export type QueryGenerateApplicationNoteWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
};

export type QueryGenerateCompanyDescriptionArgs = {
  companyName: Scalars["String"]["input"];
};

export type QueryImportTemplatesForImporterArgs = {
  importerId: Scalars["String"]["input"];
};

export type QueryImportersArgs = {
  onlyWithImportTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryRestructureJobDescriptionWithAiArgs = {
  text: Scalars["String"]["input"];
};

export type QueryResumeArgs = { id: Scalars["ID"]["input"] };

export type QueryRewriteTextWithAiArgs = { text: Scalars["String"]["input"] };

export type ResumeType = {
  __typename?: "ResumeType";
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  isDefault: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export enum SalaryPeriod {
  Hour = "HOUR",
  Month = "MONTH",
  Year = "YEAR",
}

export type Subscription = {
  __typename?: "Subscription";
  importRunEvents: ImportRunEvent;
};

export type UpdateApplicationInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type UpdateApplicationStageEventInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  toStage?: InputMaybe<ApplicationStage>;
};

export type UpdateCompanyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateDraftApplicationInput = { title: Scalars["String"]["input"] };

export type UpdateImportRunInput = { surfaceUrl: Scalars["String"]["input"] };

export type UpdateImportTemplateInput = {
  scheduleCron?: InputMaybe<Scalars["String"]["input"]>;
  scheduleEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  surfaceUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateNoteInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  expectedRevision: Scalars["Int"]["input"];
};

export type UpdateResumeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserType = {
  __typename?: "UserType";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  role: Scalars["String"]["output"];
};

export enum WeightEnum {
  High = "HIGH",
  Low = "LOW",
}

export type ApplicationSalarySelectionFragment = {
  __typename?: "ApplicationType";
  salary: {
    __typename?: "ApplicationSalary";
    minCents?: number | null;
    maxCents?: number | null;
    currency?: string | null;
    period?: SalaryPeriod | null;
  };
};

export type ApplicationsQueryVariables = Exact<{
  filter?: InputMaybe<ApplicationQuickFilter>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type ApplicationsQuery = {
  __typename?: "Query";
  applications: Array<{
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: ApplicationSource | null;
    tags: Array<string>;
    importRunId?: string | null;
    currentStage: ApplicationStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    fit?: {
      __typename?: "FitAnalysisType";
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      status: FitAnalysisStatus;
      error?: string | null;
    } | null;
    salary: {
      __typename?: "ApplicationSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    };
  }>;
};

export type ApplicationQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type ApplicationQuery = {
  __typename?: "Query";
  application: {
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: ApplicationSource | null;
    tags: Array<string>;
    importRunId?: string | null;
    currentStage: ApplicationStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    fit?: {
      __typename?: "FitAnalysisType";
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      status: FitAnalysisStatus;
      error?: string | null;
    } | null;
    salary: {
      __typename?: "ApplicationSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    };
  };
};

export type CreateApplicationMutationVariables = Exact<{
  input: CreateApplicationInput;
}>;

export type CreateApplicationMutation = {
  __typename?: "Mutation";
  createApplication: {
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: ApplicationSource | null;
    tags: Array<string>;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    salary: {
      __typename?: "ApplicationSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    };
  };
};

export type GenerateCompanyDescriptionQueryVariables = Exact<{
  companyName: Scalars["String"]["input"];
}>;

export type GenerateCompanyDescriptionQuery = {
  __typename?: "Query";
  generateCompanyDescription: string;
};

export type UpdateApplicationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateApplicationInput;
}>;

export type UpdateApplicationMutation = {
  __typename?: "Mutation";
  updateApplication: {
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: ApplicationSource | null;
    tags: Array<string>;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    salary: {
      __typename?: "ApplicationSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    };
  };
};

export type RemoveApplicationTagMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
}>;

export type RemoveApplicationTagMutation = {
  __typename?: "Mutation";
  removeApplicationTag: {
    __typename?: "ApplicationType";
    id: string;
    tags: Array<string>;
  };
};

export type DeleteApplicationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteApplicationMutation = {
  __typename?: "Mutation";
  deleteApplication: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type ApplicationStageEventsQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type ApplicationStageEventsQuery = {
  __typename?: "Query";
  applicationStageEvents: Array<{
    __typename?: "ApplicationStageEventType";
    id: string;
    applicationId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: string;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  }>;
};

export type CreateApplicationStageEventMutationVariables = Exact<{
  input: CreateApplicationStageEventInput;
}>;

export type CreateApplicationStageEventMutation = {
  __typename?: "Mutation";
  createApplicationStageEvent: {
    __typename?: "ApplicationStageEventType";
    id: string;
    applicationId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: string;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  };
};

export type UpdateApplicationStageEventMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateApplicationStageEventInput;
}>;

export type UpdateApplicationStageEventMutation = {
  __typename?: "Mutation";
  updateApplicationStageEvent: {
    __typename?: "ApplicationStageEventType";
    id: string;
    applicationId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: string;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  };
};

export type DeleteApplicationStageEventMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteApplicationStageEventMutation = {
  __typename?: "Mutation";
  deleteApplicationStageEvent: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type ApplicationNotesQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type ApplicationNotesQuery = {
  __typename?: "Query";
  applicationNotes: Array<{
    __typename?: "NoteType";
    id: string;
    applicationId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type CreateApplicationNoteMutationVariables = Exact<{
  input: CreateNoteInput;
}>;

export type CreateApplicationNoteMutation = {
  __typename?: "Mutation";
  createApplicationNote: {
    __typename?: "NoteType";
    id: string;
    applicationId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  };
};

export type UpdateApplicationNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateNoteInput;
}>;

export type UpdateApplicationNoteMutation = {
  __typename?: "Mutation";
  updateApplicationNote: {
    __typename?: "NoteType";
    id: string;
    applicationId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  };
};

export type DeleteApplicationNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteApplicationNoteMutation = {
  __typename?: "Mutation";
  deleteApplicationNote: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type GenerateApplicationNoteWithAiQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
}>;

export type GenerateApplicationNoteWithAiQuery = {
  __typename?: "Query";
  generateApplicationNoteWithAI: string;
};

export type RewriteTextWithAiQueryVariables = Exact<{
  text: Scalars["String"]["input"];
}>;

export type RewriteTextWithAiQuery = {
  __typename?: "Query";
  rewriteTextWithAI: string;
};

export type RestructureJobDescriptionWithAiQueryVariables = Exact<{
  text: Scalars["String"]["input"];
}>;

export type RestructureJobDescriptionWithAiQuery = {
  __typename?: "Query";
  restructureJobDescriptionWithAI: string;
};

export type UpdateCompanyMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateCompanyInput;
}>;

export type UpdateCompanyMutation = {
  __typename?: "Mutation";
  updateCompany: {
    __typename?: "CompanyType";
    id: string;
    name: string;
    description?: string | null;
  };
};

export type DeleteCompanyMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteCompanyMutation = {
  __typename?: "Mutation";
  deleteCompany: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CompanyApplicationsCountQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type CompanyApplicationsCountQuery = {
  __typename?: "Query";
  companyApplicationsCount: number;
};

export type CompaniesQueryVariables = Exact<{ [key: string]: never }>;

export type CompaniesQuery = {
  __typename?: "Query";
  companies: Array<{
    __typename?: "CompanyType";
    id: string;
    name: string;
    description?: string | null;
  }>;
};

export type ExchangeRatesQueryVariables = Exact<{
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]> | Scalars["String"]["input"];
}>;

export type ExchangeRatesQuery = {
  __typename?: "Query";
  exchangeRates: {
    __typename?: "CurrencyRates";
    base: string;
    rates: Array<{
      __typename?: "ExchangeRate";
      currency: string;
      rate: number;
    }>;
  };
};

export type DraftApplicationsListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type DraftApplicationsListQuery = {
  __typename?: "Query";
  draftApplications: Array<{
    __typename?: "DraftApplicationType";
    id: string;
    applicationId?: string | null;
    url?: string | null;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
    convertedAt?: any | null;
    createdAt: any;
  }>;
};

export type DraftApplicationDetailQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DraftApplicationDetailQuery = {
  __typename?: "Query";
  draftApplication: {
    __typename?: "DraftApplicationType";
    id: string;
    applicationId?: string | null;
    url?: string | null;
    title: string;
    htmlContent: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type DeleteDraftApplicationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  deleteLinkedApplication?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type DeleteDraftApplicationMutation = {
  __typename?: "Mutation";
  deleteDraftApplication: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type DeleteApplicationsForDraftMutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type DeleteApplicationsForDraftMutation = {
  __typename?: "Mutation";
  deleteApplicationsForDraft: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CreateApplicationWithAiV2MutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type CreateApplicationWithAiV2Mutation = {
  __typename?: "Mutation";
  createApplicationWithAIV2: {
    __typename?: "DraftApplicationType";
    id: string;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type CreateDraftApplicationMutationVariables = Exact<{
  input: CreateDraftApplicationInput;
}>;

export type CreateDraftApplicationMutation = {
  __typename?: "Mutation";
  createDraftApplication: {
    __typename?: "DraftApplicationType";
    id: string;
    applicationId?: string | null;
    url?: string | null;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type UpdateDraftApplicationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateDraftApplicationInput;
}>;

export type UpdateDraftApplicationMutation = {
  __typename?: "Mutation";
  updateDraftApplication: {
    __typename?: "DraftApplicationType";
    id: string;
    applicationId?: string | null;
    url?: string | null;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type ApplicationFitQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type ApplicationFitQuery = {
  __typename?: "Query";
  applicationFit?: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId: string;
    resumeId: string;
    status: FitAnalysisStatus;
    error?: string | null;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    items: Array<{
      __typename?: "FitItemType";
      requirement: string;
      source: string;
      weight?: string | null;
      type: string;
      verdict: string;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
  } | null;
};

export type GenerateApplicationFitMutationVariables = Exact<{
  input: GenerateFitInput;
}>;

export type GenerateApplicationFitMutation = {
  __typename?: "Mutation";
  generateApplicationFit: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId: string;
    resumeId: string;
    status: FitAnalysisStatus;
    error?: string | null;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    items: Array<{
      __typename?: "FitItemType";
      requirement: string;
      source: string;
      weight?: string | null;
      type: string;
      verdict: string;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
  };
};

export type ImportersListQueryVariables = Exact<{ [key: string]: never }>;

export type ImportersListQuery = {
  __typename?: "Query";
  importers: Array<{
    __typename?: "ImporterDescriptorType";
    importerId: string;
    name: string;
  }>;
};

export type ImportersForNewImportTemplatePickerQueryVariables = Exact<{
  [key: string]: never;
}>;

export type ImportersForNewImportTemplatePickerQuery = {
  __typename?: "Query";
  importers: Array<{
    __typename?: "ImporterDescriptorType";
    importerId: string;
    name: string;
  }>;
};

export type ImportTemplatesForImporterQueryVariables = Exact<{
  importerId: Scalars["String"]["input"];
}>;

export type ImportTemplatesForImporterQuery = {
  __typename?: "Query";
  importTemplatesForImporter: Array<{
    __typename?: "ImportTemplateType";
    id: string;
    importerId: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    surfaceUrl: string;
    createdAt: any;
    runs: Array<{
      __typename?: "ImportRunType";
      id: string;
      status: ImportRunStatus;
      startedAt: any;
    }>;
  }>;
};

export type UpdateImportTemplateMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateImportTemplateInput;
}>;

export type UpdateImportTemplateMutation = {
  __typename?: "Mutation";
  updateImportTemplate: {
    __typename?: "ImportTemplateType";
    id: string;
    importerId: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    surfaceUrl: string;
    createdAt: any;
    runs: Array<{
      __typename?: "ImportRunType";
      id: string;
      status: ImportRunStatus;
      startedAt: any;
    }>;
  };
};

export type DeleteImportTemplateMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteImportTemplateMutation = {
  __typename?: "Mutation";
  deleteImportTemplate: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CreateImportTemplateMutationVariables = Exact<{
  input: CreateImportTemplateInput;
}>;

export type CreateImportTemplateMutation = {
  __typename?: "Mutation";
  createImportTemplate: {
    __typename?: "ImportTemplateType";
    id: string;
    importerId: string;
    surfaceUrl: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    createdAt: any;
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: "Query";
  me: {
    __typename?: "UserType";
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  };
};

export type ResumesQueryVariables = Exact<{ [key: string]: never }>;

export type ResumesQuery = {
  __typename?: "Query";
  resumes: Array<{
    __typename?: "ResumeType";
    id: string;
    title: string;
    content: string;
    isDefault: boolean;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type ResumeQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type ResumeQuery = {
  __typename?: "Query";
  resume: {
    __typename?: "ResumeType";
    id: string;
    userId: string;
    title: string;
    content: string;
    isDefault: boolean;
    createdAt: any;
    updatedAt: any;
  };
};

export type CreateResumeMutationVariables = Exact<{ input: CreateResumeInput }>;

export type CreateResumeMutation = {
  __typename?: "Mutation";
  createResume: {
    __typename?: "ResumeType";
    id: string;
    title: string;
    content: string;
    isDefault: boolean;
    createdAt: any;
    updatedAt: any;
  };
};

export type UpdateResumeMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateResumeInput;
}>;

export type UpdateResumeMutation = {
  __typename?: "Mutation";
  updateResume: {
    __typename?: "ResumeType";
    id: string;
    title: string;
    content: string;
    isDefault: boolean;
    createdAt: any;
    updatedAt: any;
  };
};

export type DeleteResumeMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteResumeMutation = {
  __typename?: "Mutation";
  deleteResume: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type UserPreferencesQueryVariables = Exact<{ [key: string]: never }>;

export type UserPreferencesQuery = {
  __typename?: "Query";
  userPreferences: Array<{
    __typename?: "PreferenceType";
    text: string;
    weight: WeightEnum;
  }>;
};

export type UpdateUserPreferencesMutationVariables = Exact<{
  items: Array<PreferenceInput> | PreferenceInput;
}>;

export type UpdateUserPreferencesMutation = {
  __typename?: "Mutation";
  updateUserPreferences: Array<{
    __typename?: "PreferenceType";
    text: string;
    weight: WeightEnum;
  }>;
};

export const ApplicationSalarySelectionFragmentDoc = gql`
  fragment ApplicationSalarySelection on ApplicationType {
    salary {
      minCents
      maxCents
      currency
      period
    }
  }
`;
export const ApplicationsDocument = gql`
  query Applications(
    $filter: ApplicationQuickFilter
    $company: String
    $runId: ID
  ) {
    applications(filter: $filter, company: $company, runId: $runId) {
      id
      title
      companyId
      company {
        id
        name
        description
      }
      description
      urls
      source
      ...ApplicationSalarySelection
      tags
      importRunId
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      fit {
        scoreRatio
        classification
        fitCount
        gapCount
        unclearCount
        status
        error
      }
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;
export const ApplicationDocument = gql`
  query Application($id: ID!) {
    application(id: $id) {
      id
      title
      companyId
      company {
        id
        name
        description
      }
      description
      urls
      source
      ...ApplicationSalarySelection
      tags
      importRunId
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      fit {
        scoreRatio
        classification
        fitCount
        gapCount
        unclearCount
        status
        error
      }
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;
export const CreateApplicationDocument = gql`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      title
      companyId
      company {
        id
        name
        description
      }
      description
      urls
      source
      ...ApplicationSalarySelection
      tags
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;
export const GenerateCompanyDescriptionDocument = gql`
  query GenerateCompanyDescription($companyName: String!) {
    generateCompanyDescription(companyName: $companyName)
  }
`;
export const UpdateApplicationDocument = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      title
      companyId
      company {
        id
        name
        description
      }
      description
      urls
      source
      ...ApplicationSalarySelection
      tags
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;
export const RemoveApplicationTagDocument = gql`
  mutation RemoveApplicationTag($id: ID!, $tag: String!) {
    removeApplicationTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;
export const DeleteApplicationDocument = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id) {
      success
      deletedId
    }
  }
`;
export const ApplicationStageEventsDocument = gql`
  query ApplicationStageEvents($applicationId: ID!) {
    applicationStageEvents(applicationId: $applicationId) {
      id
      applicationId
      fromStage
      toStage
      source
      reason
      scheduledAt
      createdAt
    }
  }
`;
export const CreateApplicationStageEventDocument = gql`
  mutation CreateApplicationStageEvent(
    $input: CreateApplicationStageEventInput!
  ) {
    createApplicationStageEvent(input: $input) {
      id
      applicationId
      fromStage
      toStage
      source
      reason
      scheduledAt
      createdAt
    }
  }
`;
export const UpdateApplicationStageEventDocument = gql`
  mutation UpdateApplicationStageEvent(
    $id: ID!
    $input: UpdateApplicationStageEventInput!
  ) {
    updateApplicationStageEvent(id: $id, input: $input) {
      id
      applicationId
      fromStage
      toStage
      source
      reason
      scheduledAt
      createdAt
    }
  }
`;
export const DeleteApplicationStageEventDocument = gql`
  mutation DeleteApplicationStageEvent($id: ID!) {
    deleteApplicationStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;
export const ApplicationNotesDocument = gql`
  query ApplicationNotes($applicationId: ID!) {
    applicationNotes(applicationId: $applicationId) {
      id
      applicationId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;
export const CreateApplicationNoteDocument = gql`
  mutation CreateApplicationNote($input: CreateNoteInput!) {
    createApplicationNote(input: $input) {
      id
      applicationId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;
export const UpdateApplicationNoteDocument = gql`
  mutation UpdateApplicationNote($id: ID!, $input: UpdateNoteInput!) {
    updateApplicationNote(id: $id, input: $input) {
      id
      applicationId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;
export const DeleteApplicationNoteDocument = gql`
  mutation DeleteApplicationNote($id: ID!) {
    deleteApplicationNote(id: $id) {
      success
      deletedId
    }
  }
`;
export const GenerateApplicationNoteWithAiDocument = gql`
  query GenerateApplicationNoteWithAi($applicationId: ID!, $note: String!) {
    generateApplicationNoteWithAI(applicationId: $applicationId, note: $note)
  }
`;
export const RewriteTextWithAiDocument = gql`
  query RewriteTextWithAi($text: String!) {
    rewriteTextWithAI(text: $text)
  }
`;
export const RestructureJobDescriptionWithAiDocument = gql`
  query RestructureJobDescriptionWithAi($text: String!) {
    restructureJobDescriptionWithAI(text: $text)
  }
`;
export const UpdateCompanyDocument = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;
export const DeleteCompanyDocument = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      success
      deletedId
    }
  }
`;
export const CompanyApplicationsCountDocument = gql`
  query CompanyApplicationsCount($id: ID!) {
    companyApplicationsCount(id: $id)
  }
`;
export const CompaniesDocument = gql`
  query Companies {
    companies {
      id
      name
      description
    }
  }
`;
export const ExchangeRatesDocument = gql`
  query ExchangeRates($base: String!, $currencies: [String!]!) {
    exchangeRates(base: $base, currencies: $currencies) {
      base
      rates {
        currency
        rate
      }
    }
  }
`;
export const DraftApplicationsListDocument = gql`
  query DraftApplicationsList {
    draftApplications {
      id
      applicationId
      url
      title
      conversionStatus
      conversionError
      convertedAt
      createdAt
    }
  }
`;
export const DraftApplicationDetailDocument = gql`
  query DraftApplicationDetail($id: ID!) {
    draftApplication(id: $id) {
      id
      applicationId
      url
      title
      htmlContent
      conversionStatus
      conversionError
    }
  }
`;
export const DeleteDraftApplicationDocument = gql`
  mutation DeleteDraftApplication($id: ID!, $deleteLinkedApplication: Boolean) {
    deleteDraftApplication(
      id: $id
      deleteLinkedApplication: $deleteLinkedApplication
    ) {
      success
      deletedId
    }
  }
`;
export const DeleteApplicationsForDraftDocument = gql`
  mutation DeleteApplicationsForDraft($draftId: ID!) {
    deleteApplicationsForDraft(draftId: $draftId) {
      success
      deletedId
    }
  }
`;
export const CreateApplicationWithAiV2Document = gql`
  mutation CreateApplicationWithAiV2($draftId: ID!) {
    createApplicationWithAIV2(draftId: $draftId) {
      id
      title
      conversionStatus
      conversionError
    }
  }
`;
export const CreateDraftApplicationDocument = gql`
  mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {
    createDraftApplication(input: $input) {
      id
      applicationId
      url
      title
      conversionStatus
      conversionError
    }
  }
`;
export const UpdateDraftApplicationDocument = gql`
  mutation UpdateDraftApplication(
    $id: ID!
    $input: UpdateDraftApplicationInput!
  ) {
    updateDraftApplication(id: $id, input: $input) {
      id
      applicationId
      url
      title
      conversionStatus
      conversionError
    }
  }
`;
export const ApplicationFitDocument = gql`
  query ApplicationFit($applicationId: ID!) {
    applicationFit(applicationId: $applicationId) {
      id
      applicationId
      resumeId
      status
      error
      scoreRatio
      classification
      fitCount
      gapCount
      unclearCount
      items {
        requirement
        source
        weight
        type
        verdict
        jdQuote
        sourceQuotes
        suggestion
      }
      createdAt
    }
  }
`;
export const GenerateApplicationFitDocument = gql`
  mutation GenerateApplicationFit($input: GenerateFitInput!) {
    generateApplicationFit(input: $input) {
      id
      applicationId
      resumeId
      status
      error
      scoreRatio
      classification
      fitCount
      gapCount
      unclearCount
      items {
        requirement
        source
        weight
        type
        verdict
        jdQuote
        sourceQuotes
        suggestion
      }
      createdAt
    }
  }
`;
export const ImportersListDocument = gql`
  query ImportersList {
    importers(onlyWithImportTemplate: true) {
      importerId
      name
    }
  }
`;
export const ImportersForNewImportTemplatePickerDocument = gql`
  query ImportersForNewImportTemplatePicker {
    importers(onlyWithImportTemplate: false) {
      importerId
      name
    }
  }
`;
export const ImportTemplatesForImporterDocument = gql`
  query ImportTemplatesForImporter($importerId: String!) {
    importTemplatesForImporter(importerId: $importerId) {
      id
      importerId
      scheduleCron
      scheduleEnabled
      surfaceUrl
      createdAt
      runs {
        id
        status
        startedAt
      }
    }
  }
`;
export const UpdateImportTemplateDocument = gql`
  mutation UpdateImportTemplate($id: ID!, $input: UpdateImportTemplateInput!) {
    updateImportTemplate(id: $id, input: $input) {
      id
      importerId
      scheduleCron
      scheduleEnabled
      surfaceUrl
      createdAt
      runs {
        id
        status
        startedAt
      }
    }
  }
`;
export const DeleteImportTemplateDocument = gql`
  mutation DeleteImportTemplate($id: ID!) {
    deleteImportTemplate(id: $id) {
      success
      deletedId
    }
  }
`;
export const CreateImportTemplateDocument = gql`
  mutation CreateImportTemplate($input: CreateImportTemplateInput!) {
    createImportTemplate(input: $input) {
      id
      importerId
      surfaceUrl
      scheduleCron
      scheduleEnabled
      createdAt
    }
  }
`;
export const MeDocument = gql`
  query Me {
    me {
      id
      email
      name
      role
      avatarUrl
    }
  }
`;
export const ResumesDocument = gql`
  query Resumes {
    resumes {
      id
      title
      content
      isDefault
      createdAt
      updatedAt
    }
  }
`;
export const ResumeDocument = gql`
  query Resume($id: ID!) {
    resume(id: $id) {
      id
      userId
      title
      content
      isDefault
      createdAt
      updatedAt
    }
  }
`;
export const CreateResumeDocument = gql`
  mutation CreateResume($input: CreateResumeInput!) {
    createResume(input: $input) {
      id
      title
      content
      isDefault
      createdAt
      updatedAt
    }
  }
`;
export const UpdateResumeDocument = gql`
  mutation UpdateResume($id: ID!, $input: UpdateResumeInput!) {
    updateResume(id: $id, input: $input) {
      id
      title
      content
      isDefault
      createdAt
      updatedAt
    }
  }
`;
export const DeleteResumeDocument = gql`
  mutation DeleteResume($id: ID!) {
    deleteResume(id: $id) {
      success
      deletedId
    }
  }
`;
export const UserPreferencesDocument = gql`
  query UserPreferences {
    userPreferences {
      text
      weight
    }
  }
`;
export const UpdateUserPreferencesDocument = gql`
  mutation UpdateUserPreferences($items: [PreferenceInput!]!) {
    updateUserPreferences(items: $items) {
      text
      weight
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    Applications(
      variables?: ApplicationsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ApplicationsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ApplicationsQuery>({
            document: ApplicationsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Applications",
        "query",
        variables,
      );
    },
    Application(
      variables: ApplicationQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ApplicationQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ApplicationQuery>({
            document: ApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Application",
        "query",
        variables,
      );
    },
    CreateApplication(
      variables: CreateApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateApplicationMutation>({
            document: CreateApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateApplication",
        "mutation",
        variables,
      );
    },
    GenerateCompanyDescription(
      variables: GenerateCompanyDescriptionQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateCompanyDescriptionQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateCompanyDescriptionQuery>({
            document: GenerateCompanyDescriptionDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateCompanyDescription",
        "query",
        variables,
      );
    },
    UpdateApplication(
      variables: UpdateApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateApplicationMutation>({
            document: UpdateApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateApplication",
        "mutation",
        variables,
      );
    },
    RemoveApplicationTag(
      variables: RemoveApplicationTagMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<RemoveApplicationTagMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RemoveApplicationTagMutation>({
            document: RemoveApplicationTagDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "RemoveApplicationTag",
        "mutation",
        variables,
      );
    },
    DeleteApplication(
      variables: DeleteApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteApplicationMutation>({
            document: DeleteApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteApplication",
        "mutation",
        variables,
      );
    },
    ApplicationStageEvents(
      variables: ApplicationStageEventsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ApplicationStageEventsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ApplicationStageEventsQuery>({
            document: ApplicationStageEventsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ApplicationStageEvents",
        "query",
        variables,
      );
    },
    CreateApplicationStageEvent(
      variables: CreateApplicationStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateApplicationStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateApplicationStageEventMutation>({
            document: CreateApplicationStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateApplicationStageEvent",
        "mutation",
        variables,
      );
    },
    UpdateApplicationStageEvent(
      variables: UpdateApplicationStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateApplicationStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateApplicationStageEventMutation>({
            document: UpdateApplicationStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateApplicationStageEvent",
        "mutation",
        variables,
      );
    },
    DeleteApplicationStageEvent(
      variables: DeleteApplicationStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteApplicationStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteApplicationStageEventMutation>({
            document: DeleteApplicationStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteApplicationStageEvent",
        "mutation",
        variables,
      );
    },
    ApplicationNotes(
      variables: ApplicationNotesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ApplicationNotesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ApplicationNotesQuery>({
            document: ApplicationNotesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ApplicationNotes",
        "query",
        variables,
      );
    },
    CreateApplicationNote(
      variables: CreateApplicationNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateApplicationNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateApplicationNoteMutation>({
            document: CreateApplicationNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateApplicationNote",
        "mutation",
        variables,
      );
    },
    UpdateApplicationNote(
      variables: UpdateApplicationNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateApplicationNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateApplicationNoteMutation>({
            document: UpdateApplicationNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateApplicationNote",
        "mutation",
        variables,
      );
    },
    DeleteApplicationNote(
      variables: DeleteApplicationNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteApplicationNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteApplicationNoteMutation>({
            document: DeleteApplicationNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteApplicationNote",
        "mutation",
        variables,
      );
    },
    GenerateApplicationNoteWithAi(
      variables: GenerateApplicationNoteWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateApplicationNoteWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateApplicationNoteWithAiQuery>({
            document: GenerateApplicationNoteWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateApplicationNoteWithAi",
        "query",
        variables,
      );
    },
    RewriteTextWithAi(
      variables: RewriteTextWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<RewriteTextWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RewriteTextWithAiQuery>({
            document: RewriteTextWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "RewriteTextWithAi",
        "query",
        variables,
      );
    },
    RestructureJobDescriptionWithAi(
      variables: RestructureJobDescriptionWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<RestructureJobDescriptionWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RestructureJobDescriptionWithAiQuery>({
            document: RestructureJobDescriptionWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "RestructureJobDescriptionWithAi",
        "query",
        variables,
      );
    },
    UpdateCompany(
      variables: UpdateCompanyMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateCompanyMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateCompanyMutation>({
            document: UpdateCompanyDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateCompany",
        "mutation",
        variables,
      );
    },
    DeleteCompany(
      variables: DeleteCompanyMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteCompanyMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteCompanyMutation>({
            document: DeleteCompanyDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteCompany",
        "mutation",
        variables,
      );
    },
    CompanyApplicationsCount(
      variables: CompanyApplicationsCountQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CompanyApplicationsCountQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CompanyApplicationsCountQuery>({
            document: CompanyApplicationsCountDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CompanyApplicationsCount",
        "query",
        variables,
      );
    },
    Companies(
      variables?: CompaniesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CompaniesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CompaniesQuery>({
            document: CompaniesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Companies",
        "query",
        variables,
      );
    },
    ExchangeRates(
      variables: ExchangeRatesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ExchangeRatesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ExchangeRatesQuery>({
            document: ExchangeRatesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ExchangeRates",
        "query",
        variables,
      );
    },
    DraftApplicationsList(
      variables?: DraftApplicationsListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DraftApplicationsListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DraftApplicationsListQuery>({
            document: DraftApplicationsListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DraftApplicationsList",
        "query",
        variables,
      );
    },
    DraftApplicationDetail(
      variables: DraftApplicationDetailQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DraftApplicationDetailQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DraftApplicationDetailQuery>({
            document: DraftApplicationDetailDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DraftApplicationDetail",
        "query",
        variables,
      );
    },
    DeleteDraftApplication(
      variables: DeleteDraftApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteDraftApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteDraftApplicationMutation>({
            document: DeleteDraftApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteDraftApplication",
        "mutation",
        variables,
      );
    },
    DeleteApplicationsForDraft(
      variables: DeleteApplicationsForDraftMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteApplicationsForDraftMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteApplicationsForDraftMutation>({
            document: DeleteApplicationsForDraftDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteApplicationsForDraft",
        "mutation",
        variables,
      );
    },
    CreateApplicationWithAiV2(
      variables: CreateApplicationWithAiV2MutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateApplicationWithAiV2Mutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateApplicationWithAiV2Mutation>({
            document: CreateApplicationWithAiV2Document,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateApplicationWithAiV2",
        "mutation",
        variables,
      );
    },
    CreateDraftApplication(
      variables: CreateDraftApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateDraftApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateDraftApplicationMutation>({
            document: CreateDraftApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateDraftApplication",
        "mutation",
        variables,
      );
    },
    UpdateDraftApplication(
      variables: UpdateDraftApplicationMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateDraftApplicationMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateDraftApplicationMutation>({
            document: UpdateDraftApplicationDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateDraftApplication",
        "mutation",
        variables,
      );
    },
    ApplicationFit(
      variables: ApplicationFitQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ApplicationFitQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ApplicationFitQuery>({
            document: ApplicationFitDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ApplicationFit",
        "query",
        variables,
      );
    },
    GenerateApplicationFit(
      variables: GenerateApplicationFitMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateApplicationFitMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateApplicationFitMutation>({
            document: GenerateApplicationFitDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateApplicationFit",
        "mutation",
        variables,
      );
    },
    ImportersList(
      variables?: ImportersListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ImportersListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ImportersListQuery>({
            document: ImportersListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ImportersList",
        "query",
        variables,
      );
    },
    ImportersForNewImportTemplatePicker(
      variables?: ImportersForNewImportTemplatePickerQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ImportersForNewImportTemplatePickerQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ImportersForNewImportTemplatePickerQuery>({
            document: ImportersForNewImportTemplatePickerDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ImportersForNewImportTemplatePicker",
        "query",
        variables,
      );
    },
    ImportTemplatesForImporter(
      variables: ImportTemplatesForImporterQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ImportTemplatesForImporterQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ImportTemplatesForImporterQuery>({
            document: ImportTemplatesForImporterDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "ImportTemplatesForImporter",
        "query",
        variables,
      );
    },
    UpdateImportTemplate(
      variables: UpdateImportTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateImportTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateImportTemplateMutation>({
            document: UpdateImportTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateImportTemplate",
        "mutation",
        variables,
      );
    },
    DeleteImportTemplate(
      variables: DeleteImportTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteImportTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteImportTemplateMutation>({
            document: DeleteImportTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteImportTemplate",
        "mutation",
        variables,
      );
    },
    CreateImportTemplate(
      variables: CreateImportTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateImportTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateImportTemplateMutation>({
            document: CreateImportTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateImportTemplate",
        "mutation",
        variables,
      );
    },
    Me(
      variables?: MeQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<MeQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MeQuery>({
            document: MeDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Me",
        "query",
        variables,
      );
    },
    Resumes(
      variables?: ResumesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ResumesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ResumesQuery>({
            document: ResumesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Resumes",
        "query",
        variables,
      );
    },
    Resume(
      variables: ResumeQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<ResumeQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ResumeQuery>({
            document: ResumeDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Resume",
        "query",
        variables,
      );
    },
    CreateResume(
      variables: CreateResumeMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateResumeMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateResumeMutation>({
            document: CreateResumeDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateResume",
        "mutation",
        variables,
      );
    },
    UpdateResume(
      variables: UpdateResumeMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateResumeMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateResumeMutation>({
            document: UpdateResumeDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateResume",
        "mutation",
        variables,
      );
    },
    DeleteResume(
      variables: DeleteResumeMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteResumeMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteResumeMutation>({
            document: DeleteResumeDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteResume",
        "mutation",
        variables,
      );
    },
    UserPreferences(
      variables?: UserPreferencesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UserPreferencesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UserPreferencesQuery>({
            document: UserPreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UserPreferences",
        "query",
        variables,
      );
    },
    UpdateUserPreferences(
      variables: UpdateUserPreferencesMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateUserPreferencesMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateUserPreferencesMutation>({
            document: UpdateUserPreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateUserPreferences",
        "mutation",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
