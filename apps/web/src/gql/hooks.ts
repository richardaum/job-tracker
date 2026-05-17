import { gql } from "@apollo/client";
import type * as Apollo from "@apollo/client";
import * as ApolloReactHooks from "@apollo/client/react";
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
const defaultOptions = {} as const;
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
  draftApplicationId?: Maybe<Scalars["ID"]["output"]>;
  fit?: Maybe<FitAnalysisType>;
  id: Scalars["ID"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  salary: ApplicationSalary;
  source?: Maybe<ApplicationSource>;
  sourceRunId?: Maybe<Scalars["ID"]["output"]>;
  summary?: Maybe<Scalars["String"]["output"]>;
  summaryMetadata?: Maybe<AsyncMetadataType>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  urls: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
  workRegion?: Maybe<Scalars["String"]["output"]>;
};

export enum AsyncMetadataStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Processing = "PROCESSING",
}

export type AsyncMetadataType = {
  __typename?: "AsyncMetadataType";
  error?: Maybe<Scalars["String"]["output"]>;
  status: AsyncMetadataStatus;
  timestamp?: Maybe<Scalars["String"]["output"]>;
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

export type ConversionMetadataType = {
  __typename?: "ConversionMetadataType";
  error?: Maybe<Scalars["String"]["output"]>;
  status: DraftApplicationConversionStatus;
  timestamp?: Maybe<Scalars["String"]["output"]>;
};

export type CreateApplicationInput = {
  company: Scalars["String"]["input"];
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  sourceRunId?: InputMaybe<Scalars["ID"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
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

export type CreateNoteInput = {
  applicationId: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
};

export type CreateResumeInput = {
  content: Scalars["String"]["input"];
  isDefault?: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
};

export type CreateSourceRunInput = {
  sourceProfileId: Scalars["String"]["input"];
};

export type CreateSourceTemplateInput = {
  sourceProfileId: Scalars["String"]["input"];
  surfaceUrl: Scalars["String"]["input"];
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
  conversionMetadata?: Maybe<ConversionMetadataType>;
  createdAt: Scalars["DateTime"]["output"];
  fit?: Maybe<FitAnalysisType>;
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

export type FitAnalysisType = {
  __typename?: "FitAnalysisType";
  application?: Maybe<ApplicationType>;
  applicationId?: Maybe<Scalars["ID"]["output"]>;
  classification?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  draftApplication?: Maybe<DraftApplicationType>;
  draftApplicationId?: Maybe<Scalars["ID"]["output"]>;
  fitCount: Scalars["Int"]["output"];
  gapCount: Scalars["Int"]["output"];
  generationMetadata?: Maybe<AsyncMetadataType>;
  id: Scalars["ID"]["output"];
  items: Array<FitItemType>;
  resumeId: Scalars["ID"]["output"];
  scoreRatio?: Maybe<Scalars["Float"]["output"]>;
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

export type GenerateDraftFitInput = {
  draftApplicationId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export type GenerateFitInput = {
  applicationId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  claimSourceRun?: Maybe<SourceRunType>;
  clearSourceRuns: Scalars["Boolean"]["output"];
  createApplication: ApplicationType;
  createApplicationNote: NoteType;
  createApplicationStageEvent: ApplicationStageEventType;
  createApplicationWithAI: DraftApplicationType;
  createDraftApplication: DraftApplicationType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deleteApplication: DeleteMutationPayloadType;
  deleteApplicationNote: DeleteMutationPayloadType;
  deleteApplicationStageEvent: DeleteMutationPayloadType;
  deleteApplicationsForDraft: DeleteMutationPayloadType;
  deleteCompany: DeleteMutationPayloadType;
  deleteDraftApplication: DeleteMutationPayloadType;
  deleteFitAnalysis: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachApplicationsFromSourceRun: Scalars["Int"]["output"];
  generateApplicationFit: FitAnalysisType;
  generateApplicationSummary: ApplicationType;
  generateDraftApplicationFit: FitAnalysisType;
  removeApplicationTag: ApplicationType;
  rerunSourceTemplate: SourceRunType;
  updateApplication: ApplicationType;
  updateApplicationNote: NoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
  updateCompany: CompanyType;
  updateDraftApplication: DraftApplicationType;
  updateResume: ResumeType;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateSourceTemplate: SourceTemplateType;
  updateWorkPreferences: Array<PreferenceType>;
};

export type MutationClaimSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationCreateApplicationArgs = { input: CreateApplicationInput };

export type MutationCreateApplicationNoteArgs = { input: CreateNoteInput };

export type MutationCreateApplicationStageEventArgs = {
  input: CreateApplicationStageEventInput;
};

export type MutationCreateApplicationWithAiArgs = {
  draftId: Scalars["ID"]["input"];
};

export type MutationCreateDraftApplicationArgs = {
  input: CreateDraftApplicationInput;
};

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationCreateSourceRunArgs = { input: CreateSourceRunInput };

export type MutationCreateSourceTemplateArgs = {
  input: CreateSourceTemplateInput;
};

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

export type MutationDeleteFitAnalysisArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteResumeArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceTemplateArgs = { id: Scalars["ID"]["input"] };

export type MutationDetachApplicationsFromSourceRunArgs = {
  sourceRunId: Scalars["ID"]["input"];
};

export type MutationGenerateApplicationFitArgs = { input: GenerateFitInput };

export type MutationGenerateApplicationSummaryArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type MutationGenerateDraftApplicationFitArgs = {
  input: GenerateDraftFitInput;
};

export type MutationRemoveApplicationTagArgs = {
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
};

export type MutationRerunSourceTemplateArgs = {
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

export type MutationUpdateResumeArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateResumeInput;
};

export type MutationUpdateSourceRunArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSourceRunInput;
};

export type MutationUpdateSourceRunStatusArgs = {
  id: Scalars["ID"]["input"];
  status: SourceRunStatus;
};

export type MutationUpdateSourceTemplateArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSourceTemplateInput;
};

export type MutationUpdateWorkPreferencesArgs = {
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
  weight: Weight;
};

export type PreferenceType = {
  __typename?: "PreferenceType";
  text: Scalars["String"]["output"];
  weight: Weight;
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
  draftApplicationFit?: Maybe<FitAnalysisType>;
  draftApplications: Array<DraftApplicationType>;
  exchangeRates: CurrencyRates;
  fit?: Maybe<FitAnalysisType>;
  fitAnalyses: Array<FitAnalysisType>;
  generateApplicationLocationWithAI?: Maybe<Scalars["String"]["output"]>;
  generateApplicationNoteWithAI: Scalars["String"]["output"];
  generateApplicationWorkRegionWithAI?: Maybe<Scalars["String"]["output"]>;
  generateCompanyDescription: Scalars["String"]["output"];
  me: UserType;
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars["String"]["output"];
  sourceProfiles: Array<SourceProfileType>;
  sourceRuns: Array<SourceRunType>;
  sourceTemplates: Array<SourceTemplateType>;
  sourceTemplatesForSourceProfile: Array<SourceTemplateType>;
  workPreferences: Array<PreferenceType>;
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

export type QueryDraftApplicationFitArgs = {
  draftApplicationId: Scalars["ID"]["input"];
};

export type QueryExchangeRatesArgs = {
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]>;
};

export type QueryFitArgs = { id: Scalars["ID"]["input"] };

export type QueryGenerateApplicationLocationWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryGenerateApplicationNoteWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
};

export type QueryGenerateApplicationWorkRegionWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryGenerateCompanyDescriptionArgs = {
  companyName: Scalars["String"]["input"];
};

export type QueryRestructureJobDescriptionWithAiArgs = {
  text: Scalars["String"]["input"];
};

export type QueryResumeArgs = { id: Scalars["ID"]["input"] };

export type QueryRewriteTextWithAiArgs = { text: Scalars["String"]["input"] };

export type QuerySourceProfilesArgs = {
  onlyWithSourceTemplate?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QuerySourceTemplatesForSourceProfileArgs = {
  sourceProfileId: Scalars["String"]["input"];
};

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

export type SourceProfileType = {
  __typename?: "SourceProfileType";
  name: Scalars["String"]["output"];
  sourceProfileId: Scalars["String"]["output"];
  templates: Array<SourceTemplateType>;
};

export type SourceRunEvent = {
  __typename?: "SourceRunEvent";
  occurredAt: Scalars["DateTime"]["output"];
  run: SourceRunType;
  type: SourceRunEventType;
};

export enum SourceRunEventType {
  SourceRunCreated = "SOURCE_RUN_CREATED",
}

export enum SourceRunStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Running = "RUNNING",
}

export type SourceRunType = {
  __typename?: "SourceRunType";
  id: Scalars["ID"]["output"];
  sourceProfile: Scalars["String"]["output"];
  sourceProfileId: Scalars["String"]["output"];
  startedAt: Scalars["DateTime"]["output"];
  status: SourceRunStatus;
  surfaceUrl: Scalars["String"]["output"];
  templateId: Scalars["ID"]["output"];
};

export type SourceTemplateType = {
  __typename?: "SourceTemplateType";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  runs: Array<SourceRunType>;
  scheduleCron?: Maybe<Scalars["String"]["output"]>;
  scheduleEnabled: Scalars["Boolean"]["output"];
  sourceProfileId: Scalars["String"]["output"];
  surfaceUrl: Scalars["String"]["output"];
};

export type Subscription = {
  __typename?: "Subscription";
  sourceRunEvents: SourceRunEvent;
};

export type UpdateApplicationInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
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

export type UpdateNoteInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  expectedRevision: Scalars["Int"]["input"];
};

export type UpdateResumeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSourceRunInput = { surfaceUrl: Scalars["String"]["input"] };

export type UpdateSourceTemplateInput = {
  scheduleCron?: InputMaybe<Scalars["String"]["input"]>;
  scheduleEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  surfaceUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserType = {
  __typename?: "UserType";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  role: Scalars["String"]["output"];
};

export enum Weight {
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
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
    summary?: string | null;
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
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
    fit?: {
      __typename?: "FitAnalysisType";
      id: string;
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status: AsyncMetadataStatus;
        error?: string | null;
        timestamp?: string | null;
      } | null;
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
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
    summary?: string | null;
    currentStage: ApplicationStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    draftApplicationId?: string | null;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
    fit?: {
      __typename?: "FitAnalysisType";
      id: string;
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status: AsyncMetadataStatus;
        error?: string | null;
        timestamp?: string | null;
      } | null;
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
    location?: string | null;
    workRegion?: string | null;
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
    location?: string | null;
    workRegion?: string | null;
    summary?: string | null;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
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

export type GenerateApplicationLocationWithAiQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type GenerateApplicationLocationWithAiQuery = {
  __typename?: "Query";
  generateApplicationLocationWithAI?: string | null;
};

export type GenerateApplicationWorkRegionWithAiQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type GenerateApplicationWorkRegionWithAiQuery = {
  __typename?: "Query";
  generateApplicationWorkRegionWithAI?: string | null;
};

export type GenerateApplicationSummaryMutationVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type GenerateApplicationSummaryMutation = {
  __typename?: "Mutation";
  generateApplicationSummary: {
    __typename?: "ApplicationType";
    id: string;
    summary?: string | null;
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
  };
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
    createdAt: any;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftApplicationConversionStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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
    createdAt: any;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftApplicationConversionStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
    fit?: {
      __typename?: "FitAnalysisType";
      id: string;
      applicationId?: string | null;
      draftApplicationId?: string | null;
      resumeId: string;
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      createdAt: any;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status: AsyncMetadataStatus;
        error?: string | null;
        timestamp?: string | null;
      } | null;
    } | null;
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

export type CreateApplicationWithAiMutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type CreateApplicationWithAiMutation = {
  __typename?: "Mutation";
  createApplicationWithAI: {
    __typename?: "DraftApplicationType";
    id: string;
    title: string;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftApplicationConversionStatus;
      error?: string | null;
    } | null;
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
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftApplicationConversionStatus;
      error?: string | null;
    } | null;
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
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftApplicationConversionStatus;
      error?: string | null;
    } | null;
  };
};

export type FitAnalysesListQueryVariables = Exact<{ [key: string]: never }>;

export type FitAnalysesListQuery = {
  __typename?: "Query";
  fitAnalyses: Array<{
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    updatedAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
    application?: {
      __typename?: "ApplicationType";
      id: string;
      title: string;
      company: { __typename?: "CompanyType"; id: string; name: string };
    } | null;
    draftApplication?: {
      __typename?: "DraftApplicationType";
      id: string;
      title: string;
    } | null;
  }>;
};

export type FitQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type FitQuery = {
  __typename?: "Query";
  fit?: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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
    application?: {
      __typename?: "ApplicationType";
      id: string;
      title: string;
      company: { __typename?: "CompanyType"; id: string; name: string };
    } | null;
    draftApplication?: {
      __typename?: "DraftApplicationType";
      id: string;
      title: string;
    } | null;
  } | null;
};

export type ApplicationFitQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
}>;

export type ApplicationFitQuery = {
  __typename?: "Query";
  applicationFit?: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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

export type DraftApplicationFitQueryVariables = Exact<{
  draftApplicationId: Scalars["ID"]["input"];
}>;

export type DraftApplicationFitQuery = {
  __typename?: "Query";
  draftApplicationFit?: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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

export type GenerateDraftApplicationFitMutationVariables = Exact<{
  input: GenerateDraftFitInput;
}>;

export type GenerateDraftApplicationFitMutation = {
  __typename?: "Mutation";
  generateDraftApplicationFit: {
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
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

export type DeleteFitAnalysisMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteFitAnalysisMutation = {
  __typename?: "Mutation";
  deleteFitAnalysis: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
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

export type SourceProfilesListQueryVariables = Exact<{ [key: string]: never }>;

export type SourceProfilesListQuery = {
  __typename?: "Query";
  sourceProfiles: Array<{
    __typename?: "SourceProfileType";
    sourceProfileId: string;
    name: string;
  }>;
};

export type SourceProfilesForNewSourcePickerQueryVariables = Exact<{
  [key: string]: never;
}>;

export type SourceProfilesForNewSourcePickerQuery = {
  __typename?: "Query";
  sourceProfiles: Array<{
    __typename?: "SourceProfileType";
    sourceProfileId: string;
    name: string;
  }>;
};

export type SourcesForSourceProfileQueryVariables = Exact<{
  sourceProfileId: Scalars["String"]["input"];
}>;

export type SourcesForSourceProfileQuery = {
  __typename?: "Query";
  sourceTemplatesForSourceProfile: Array<{
    __typename?: "SourceTemplateType";
    id: string;
    sourceProfileId: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    surfaceUrl: string;
    createdAt: any;
    runs: Array<{
      __typename?: "SourceRunType";
      id: string;
      status: SourceRunStatus;
      startedAt: any;
    }>;
  }>;
};

export type UpdateSourceTemplateMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSourceTemplateInput;
}>;

export type UpdateSourceTemplateMutation = {
  __typename?: "Mutation";
  updateSourceTemplate: {
    __typename?: "SourceTemplateType";
    id: string;
    sourceProfileId: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    surfaceUrl: string;
    createdAt: any;
    runs: Array<{
      __typename?: "SourceRunType";
      id: string;
      status: SourceRunStatus;
      startedAt: any;
    }>;
  };
};

export type DeleteSourceTemplateMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteSourceTemplateMutation = {
  __typename?: "Mutation";
  deleteSourceTemplate: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CreateSourceTemplateMutationVariables = Exact<{
  input: CreateSourceTemplateInput;
}>;

export type CreateSourceTemplateMutation = {
  __typename?: "Mutation";
  createSourceTemplate: {
    __typename?: "SourceTemplateType";
    id: string;
    sourceProfileId: string;
    surfaceUrl: string;
    scheduleCron?: string | null;
    scheduleEnabled: boolean;
    createdAt: any;
  };
};

export type WorkPreferencesQueryVariables = Exact<{ [key: string]: never }>;

export type WorkPreferencesQuery = {
  __typename?: "Query";
  workPreferences: Array<{
    __typename?: "PreferenceType";
    text: string;
    weight: Weight;
  }>;
};

export type UpdateWorkPreferencesMutationVariables = Exact<{
  items: Array<PreferenceInput> | PreferenceInput;
}>;

export type UpdateWorkPreferencesMutation = {
  __typename?: "Mutation";
  updateWorkPreferences: Array<{
    __typename?: "PreferenceType";
    text: string;
    weight: Weight;
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
      location
      workRegion
      sourceRunId
      summary
      summaryMetadata {
        status
        error
        timestamp
      }
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      fit {
        id
        scoreRatio
        classification
        fitCount
        gapCount
        unclearCount
        generationMetadata {
          status
          error
          timestamp
        }
      }
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

/**
 * __useApplicationsQuery__
 *
 * To run a query within a React component, call `useApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      company: // value for 'company'
 *      runId: // value for 'runId'
 *   },
 * });
 */
export function useApplicationsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ApplicationsQuery,
    ApplicationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ApplicationsQuery,
    ApplicationsQueryVariables
  >(ApplicationsDocument, options);
}
export function useApplicationsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ApplicationsQuery,
    ApplicationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ApplicationsQuery,
    ApplicationsQueryVariables
  >(ApplicationsDocument, options);
}

export type ApplicationsQueryHookResult = ReturnType<
  typeof useApplicationsQuery
>;
export type ApplicationsLazyQueryHookResult = ReturnType<
  typeof useApplicationsLazyQuery
>;

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
      location
      workRegion
      sourceRunId
      summary
      summaryMetadata {
        status
        error
        timestamp
      }
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      draftApplicationId
      fit {
        id
        scoreRatio
        classification
        fitCount
        gapCount
        unclearCount
        generationMetadata {
          status
          error
          timestamp
        }
      }
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

/**
 * __useApplicationQuery__
 *
 * To run a query within a React component, call `useApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApplicationQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ApplicationQuery,
    ApplicationQueryVariables
  > &
    (
      | { variables: ApplicationQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ApplicationQuery, ApplicationQueryVariables>(
    ApplicationDocument,
    options,
  );
}
export function useApplicationLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ApplicationQuery,
    ApplicationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ApplicationQuery,
    ApplicationQueryVariables
  >(ApplicationDocument, options);
}

export type ApplicationQueryHookResult = ReturnType<typeof useApplicationQuery>;
export type ApplicationLazyQueryHookResult = ReturnType<
  typeof useApplicationLazyQuery
>;

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
      location
      workRegion
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

/**
 * __useCreateApplicationMutation__
 *
 * To run a mutation, you first call `useCreateApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationMutation, { data, loading, error }] = useCreateApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateApplicationMutation,
    CreateApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateApplicationMutation,
    CreateApplicationMutationVariables
  >(CreateApplicationDocument, options);
}

export const GenerateCompanyDescriptionDocument = gql`
  query GenerateCompanyDescription($companyName: String!) {
    generateCompanyDescription(companyName: $companyName)
  }
`;

/**
 * __useGenerateCompanyDescriptionQuery__
 *
 * To run a query within a React component, call `useGenerateCompanyDescriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateCompanyDescriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateCompanyDescriptionQuery({
 *   variables: {
 *      companyName: // value for 'companyName'
 *   },
 * });
 */
export function useGenerateCompanyDescriptionQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateCompanyDescriptionQuery,
    GenerateCompanyDescriptionQueryVariables
  > &
    (
      | { variables: GenerateCompanyDescriptionQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateCompanyDescriptionQuery,
    GenerateCompanyDescriptionQueryVariables
  >(GenerateCompanyDescriptionDocument, options);
}
export function useGenerateCompanyDescriptionLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateCompanyDescriptionQuery,
    GenerateCompanyDescriptionQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateCompanyDescriptionQuery,
    GenerateCompanyDescriptionQueryVariables
  >(GenerateCompanyDescriptionDocument, options);
}

export type GenerateCompanyDescriptionQueryHookResult = ReturnType<
  typeof useGenerateCompanyDescriptionQuery
>;
export type GenerateCompanyDescriptionLazyQueryHookResult = ReturnType<
  typeof useGenerateCompanyDescriptionLazyQuery
>;

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
      location
      workRegion
      summary
      summaryMetadata {
        status
        error
        timestamp
      }
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

/**
 * __useUpdateApplicationMutation__
 *
 * To run a mutation, you first call `useUpdateApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApplicationMutation, { data, loading, error }] = useUpdateApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateApplicationMutation,
    UpdateApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateApplicationMutation,
    UpdateApplicationMutationVariables
  >(UpdateApplicationDocument, options);
}

export const RemoveApplicationTagDocument = gql`
  mutation RemoveApplicationTag($id: ID!, $tag: String!) {
    removeApplicationTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;

/**
 * __useRemoveApplicationTagMutation__
 *
 * To run a mutation, you first call `useRemoveApplicationTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveApplicationTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeApplicationTagMutation, { data, loading, error }] = useRemoveApplicationTagMutation({
 *   variables: {
 *      id: // value for 'id'
 *      tag: // value for 'tag'
 *   },
 * });
 */
export function useRemoveApplicationTagMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    RemoveApplicationTagMutation,
    RemoveApplicationTagMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    RemoveApplicationTagMutation,
    RemoveApplicationTagMutationVariables
  >(RemoveApplicationTagDocument, options);
}

export const DeleteApplicationDocument = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteApplicationMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationMutation, { data, loading, error }] = useDeleteApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteApplicationMutation,
    DeleteApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteApplicationMutation,
    DeleteApplicationMutationVariables
  >(DeleteApplicationDocument, options);
}

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

/**
 * __useApplicationStageEventsQuery__
 *
 * To run a query within a React component, call `useApplicationStageEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationStageEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationStageEventsQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useApplicationStageEventsQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ApplicationStageEventsQuery,
    ApplicationStageEventsQueryVariables
  > &
    (
      | { variables: ApplicationStageEventsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ApplicationStageEventsQuery,
    ApplicationStageEventsQueryVariables
  >(ApplicationStageEventsDocument, options);
}
export function useApplicationStageEventsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ApplicationStageEventsQuery,
    ApplicationStageEventsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ApplicationStageEventsQuery,
    ApplicationStageEventsQueryVariables
  >(ApplicationStageEventsDocument, options);
}

export type ApplicationStageEventsQueryHookResult = ReturnType<
  typeof useApplicationStageEventsQuery
>;
export type ApplicationStageEventsLazyQueryHookResult = ReturnType<
  typeof useApplicationStageEventsLazyQuery
>;

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

/**
 * __useCreateApplicationStageEventMutation__
 *
 * To run a mutation, you first call `useCreateApplicationStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationStageEventMutation, { data, loading, error }] = useCreateApplicationStageEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApplicationStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateApplicationStageEventMutation,
    CreateApplicationStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateApplicationStageEventMutation,
    CreateApplicationStageEventMutationVariables
  >(CreateApplicationStageEventDocument, options);
}

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

/**
 * __useUpdateApplicationStageEventMutation__
 *
 * To run a mutation, you first call `useUpdateApplicationStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApplicationStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApplicationStageEventMutation, { data, loading, error }] = useUpdateApplicationStageEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateApplicationStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateApplicationStageEventMutation,
    UpdateApplicationStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateApplicationStageEventMutation,
    UpdateApplicationStageEventMutationVariables
  >(UpdateApplicationStageEventDocument, options);
}

export const DeleteApplicationStageEventDocument = gql`
  mutation DeleteApplicationStageEvent($id: ID!) {
    deleteApplicationStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteApplicationStageEventMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationStageEventMutation, { data, loading, error }] = useDeleteApplicationStageEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApplicationStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteApplicationStageEventMutation,
    DeleteApplicationStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteApplicationStageEventMutation,
    DeleteApplicationStageEventMutationVariables
  >(DeleteApplicationStageEventDocument, options);
}

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

/**
 * __useApplicationNotesQuery__
 *
 * To run a query within a React component, call `useApplicationNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationNotesQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useApplicationNotesQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ApplicationNotesQuery,
    ApplicationNotesQueryVariables
  > &
    (
      | { variables: ApplicationNotesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ApplicationNotesQuery,
    ApplicationNotesQueryVariables
  >(ApplicationNotesDocument, options);
}
export function useApplicationNotesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ApplicationNotesQuery,
    ApplicationNotesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ApplicationNotesQuery,
    ApplicationNotesQueryVariables
  >(ApplicationNotesDocument, options);
}

export type ApplicationNotesQueryHookResult = ReturnType<
  typeof useApplicationNotesQuery
>;
export type ApplicationNotesLazyQueryHookResult = ReturnType<
  typeof useApplicationNotesLazyQuery
>;

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

/**
 * __useCreateApplicationNoteMutation__
 *
 * To run a mutation, you first call `useCreateApplicationNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationNoteMutation, { data, loading, error }] = useCreateApplicationNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateApplicationNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateApplicationNoteMutation,
    CreateApplicationNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateApplicationNoteMutation,
    CreateApplicationNoteMutationVariables
  >(CreateApplicationNoteDocument, options);
}

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

/**
 * __useUpdateApplicationNoteMutation__
 *
 * To run a mutation, you first call `useUpdateApplicationNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateApplicationNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateApplicationNoteMutation, { data, loading, error }] = useUpdateApplicationNoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateApplicationNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateApplicationNoteMutation,
    UpdateApplicationNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateApplicationNoteMutation,
    UpdateApplicationNoteMutationVariables
  >(UpdateApplicationNoteDocument, options);
}

export const DeleteApplicationNoteDocument = gql`
  mutation DeleteApplicationNote($id: ID!) {
    deleteApplicationNote(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteApplicationNoteMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationNoteMutation, { data, loading, error }] = useDeleteApplicationNoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteApplicationNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteApplicationNoteMutation,
    DeleteApplicationNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteApplicationNoteMutation,
    DeleteApplicationNoteMutationVariables
  >(DeleteApplicationNoteDocument, options);
}

export const GenerateApplicationNoteWithAiDocument = gql`
  query GenerateApplicationNoteWithAi($applicationId: ID!, $note: String!) {
    generateApplicationNoteWithAI(applicationId: $applicationId, note: $note)
  }
`;

/**
 * __useGenerateApplicationNoteWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateApplicationNoteWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateApplicationNoteWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateApplicationNoteWithAiQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useGenerateApplicationNoteWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateApplicationNoteWithAiQuery,
    GenerateApplicationNoteWithAiQueryVariables
  > &
    (
      | {
          variables: GenerateApplicationNoteWithAiQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateApplicationNoteWithAiQuery,
    GenerateApplicationNoteWithAiQueryVariables
  >(GenerateApplicationNoteWithAiDocument, options);
}
export function useGenerateApplicationNoteWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateApplicationNoteWithAiQuery,
    GenerateApplicationNoteWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateApplicationNoteWithAiQuery,
    GenerateApplicationNoteWithAiQueryVariables
  >(GenerateApplicationNoteWithAiDocument, options);
}

export type GenerateApplicationNoteWithAiQueryHookResult = ReturnType<
  typeof useGenerateApplicationNoteWithAiQuery
>;
export type GenerateApplicationNoteWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateApplicationNoteWithAiLazyQuery
>;

export const RewriteTextWithAiDocument = gql`
  query RewriteTextWithAi($text: String!) {
    rewriteTextWithAI(text: $text)
  }
`;

/**
 * __useRewriteTextWithAiQuery__
 *
 * To run a query within a React component, call `useRewriteTextWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewriteTextWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewriteTextWithAiQuery({
 *   variables: {
 *      text: // value for 'text'
 *   },
 * });
 */
export function useRewriteTextWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    RewriteTextWithAiQuery,
    RewriteTextWithAiQueryVariables
  > &
    (
      | { variables: RewriteTextWithAiQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    RewriteTextWithAiQuery,
    RewriteTextWithAiQueryVariables
  >(RewriteTextWithAiDocument, options);
}
export function useRewriteTextWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    RewriteTextWithAiQuery,
    RewriteTextWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    RewriteTextWithAiQuery,
    RewriteTextWithAiQueryVariables
  >(RewriteTextWithAiDocument, options);
}

export type RewriteTextWithAiQueryHookResult = ReturnType<
  typeof useRewriteTextWithAiQuery
>;
export type RewriteTextWithAiLazyQueryHookResult = ReturnType<
  typeof useRewriteTextWithAiLazyQuery
>;

export const RestructureJobDescriptionWithAiDocument = gql`
  query RestructureJobDescriptionWithAi($text: String!) {
    restructureJobDescriptionWithAI(text: $text)
  }
`;

/**
 * __useRestructureJobDescriptionWithAiQuery__
 *
 * To run a query within a React component, call `useRestructureJobDescriptionWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useRestructureJobDescriptionWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRestructureJobDescriptionWithAiQuery({
 *   variables: {
 *      text: // value for 'text'
 *   },
 * });
 */
export function useRestructureJobDescriptionWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    RestructureJobDescriptionWithAiQuery,
    RestructureJobDescriptionWithAiQueryVariables
  > &
    (
      | {
          variables: RestructureJobDescriptionWithAiQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    RestructureJobDescriptionWithAiQuery,
    RestructureJobDescriptionWithAiQueryVariables
  >(RestructureJobDescriptionWithAiDocument, options);
}
export function useRestructureJobDescriptionWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    RestructureJobDescriptionWithAiQuery,
    RestructureJobDescriptionWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    RestructureJobDescriptionWithAiQuery,
    RestructureJobDescriptionWithAiQueryVariables
  >(RestructureJobDescriptionWithAiDocument, options);
}

export type RestructureJobDescriptionWithAiQueryHookResult = ReturnType<
  typeof useRestructureJobDescriptionWithAiQuery
>;
export type RestructureJobDescriptionWithAiLazyQueryHookResult = ReturnType<
  typeof useRestructureJobDescriptionWithAiLazyQuery
>;

export const GenerateApplicationLocationWithAiDocument = gql`
  query GenerateApplicationLocationWithAi($applicationId: ID!) {
    generateApplicationLocationWithAI(applicationId: $applicationId)
  }
`;

/**
 * __useGenerateApplicationLocationWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateApplicationLocationWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateApplicationLocationWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateApplicationLocationWithAiQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useGenerateApplicationLocationWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateApplicationLocationWithAiQuery,
    GenerateApplicationLocationWithAiQueryVariables
  > &
    (
      | {
          variables: GenerateApplicationLocationWithAiQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateApplicationLocationWithAiQuery,
    GenerateApplicationLocationWithAiQueryVariables
  >(GenerateApplicationLocationWithAiDocument, options);
}
export function useGenerateApplicationLocationWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateApplicationLocationWithAiQuery,
    GenerateApplicationLocationWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateApplicationLocationWithAiQuery,
    GenerateApplicationLocationWithAiQueryVariables
  >(GenerateApplicationLocationWithAiDocument, options);
}

export type GenerateApplicationLocationWithAiQueryHookResult = ReturnType<
  typeof useGenerateApplicationLocationWithAiQuery
>;
export type GenerateApplicationLocationWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateApplicationLocationWithAiLazyQuery
>;

export const GenerateApplicationWorkRegionWithAiDocument = gql`
  query GenerateApplicationWorkRegionWithAi($applicationId: ID!) {
    generateApplicationWorkRegionWithAI(applicationId: $applicationId)
  }
`;

/**
 * __useGenerateApplicationWorkRegionWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateApplicationWorkRegionWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateApplicationWorkRegionWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateApplicationWorkRegionWithAiQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useGenerateApplicationWorkRegionWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateApplicationWorkRegionWithAiQuery,
    GenerateApplicationWorkRegionWithAiQueryVariables
  > &
    (
      | {
          variables: GenerateApplicationWorkRegionWithAiQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateApplicationWorkRegionWithAiQuery,
    GenerateApplicationWorkRegionWithAiQueryVariables
  >(GenerateApplicationWorkRegionWithAiDocument, options);
}
export function useGenerateApplicationWorkRegionWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateApplicationWorkRegionWithAiQuery,
    GenerateApplicationWorkRegionWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateApplicationWorkRegionWithAiQuery,
    GenerateApplicationWorkRegionWithAiQueryVariables
  >(GenerateApplicationWorkRegionWithAiDocument, options);
}

export type GenerateApplicationWorkRegionWithAiQueryHookResult = ReturnType<
  typeof useGenerateApplicationWorkRegionWithAiQuery
>;
export type GenerateApplicationWorkRegionWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateApplicationWorkRegionWithAiLazyQuery
>;

export const GenerateApplicationSummaryDocument = gql`
  mutation GenerateApplicationSummary($applicationId: ID!) {
    generateApplicationSummary(applicationId: $applicationId) {
      id
      summary
      summaryMetadata {
        status
        error
        timestamp
      }
    }
  }
`;

/**
 * __useGenerateApplicationSummaryMutation__
 *
 * To run a mutation, you first call `useGenerateApplicationSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateApplicationSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateApplicationSummaryMutation, { data, loading, error }] = useGenerateApplicationSummaryMutation({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useGenerateApplicationSummaryMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    GenerateApplicationSummaryMutation,
    GenerateApplicationSummaryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    GenerateApplicationSummaryMutation,
    GenerateApplicationSummaryMutationVariables
  >(GenerateApplicationSummaryDocument, options);
}

export const UpdateCompanyDocument = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

/**
 * __useUpdateCompanyMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyMutation, { data, loading, error }] = useUpdateCompanyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCompanyMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateCompanyMutation,
    UpdateCompanyMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateCompanyMutation,
    UpdateCompanyMutationVariables
  >(UpdateCompanyDocument, options);
}

export const DeleteCompanyDocument = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteCompanyMutation__
 *
 * To run a mutation, you first call `useDeleteCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCompanyMutation, { data, loading, error }] = useDeleteCompanyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCompanyMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteCompanyMutation,
    DeleteCompanyMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteCompanyMutation,
    DeleteCompanyMutationVariables
  >(DeleteCompanyDocument, options);
}

export const CompanyApplicationsCountDocument = gql`
  query CompanyApplicationsCount($id: ID!) {
    companyApplicationsCount(id: $id)
  }
`;

/**
 * __useCompanyApplicationsCountQuery__
 *
 * To run a query within a React component, call `useCompanyApplicationsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyApplicationsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyApplicationsCountQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCompanyApplicationsCountQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    CompanyApplicationsCountQuery,
    CompanyApplicationsCountQueryVariables
  > &
    (
      | { variables: CompanyApplicationsCountQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    CompanyApplicationsCountQuery,
    CompanyApplicationsCountQueryVariables
  >(CompanyApplicationsCountDocument, options);
}
export function useCompanyApplicationsCountLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CompanyApplicationsCountQuery,
    CompanyApplicationsCountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    CompanyApplicationsCountQuery,
    CompanyApplicationsCountQueryVariables
  >(CompanyApplicationsCountDocument, options);
}

export type CompanyApplicationsCountQueryHookResult = ReturnType<
  typeof useCompanyApplicationsCountQuery
>;
export type CompanyApplicationsCountLazyQueryHookResult = ReturnType<
  typeof useCompanyApplicationsCountLazyQuery
>;

export const CompaniesDocument = gql`
  query Companies {
    companies {
      id
      name
      description
    }
  }
`;

/**
 * __useCompaniesQuery__
 *
 * To run a query within a React component, call `useCompaniesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompaniesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompaniesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCompaniesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    CompaniesQuery,
    CompaniesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<CompaniesQuery, CompaniesQueryVariables>(
    CompaniesDocument,
    options,
  );
}
export function useCompaniesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CompaniesQuery,
    CompaniesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<CompaniesQuery, CompaniesQueryVariables>(
    CompaniesDocument,
    options,
  );
}

export type CompaniesQueryHookResult = ReturnType<typeof useCompaniesQuery>;
export type CompaniesLazyQueryHookResult = ReturnType<
  typeof useCompaniesLazyQuery
>;

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

/**
 * __useExchangeRatesQuery__
 *
 * To run a query within a React component, call `useExchangeRatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useExchangeRatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExchangeRatesQuery({
 *   variables: {
 *      base: // value for 'base'
 *      currencies: // value for 'currencies'
 *   },
 * });
 */
export function useExchangeRatesQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ExchangeRatesQuery,
    ExchangeRatesQueryVariables
  > &
    (
      | { variables: ExchangeRatesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ExchangeRatesQuery,
    ExchangeRatesQueryVariables
  >(ExchangeRatesDocument, options);
}
export function useExchangeRatesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ExchangeRatesQuery,
    ExchangeRatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ExchangeRatesQuery,
    ExchangeRatesQueryVariables
  >(ExchangeRatesDocument, options);
}

export type ExchangeRatesQueryHookResult = ReturnType<
  typeof useExchangeRatesQuery
>;
export type ExchangeRatesLazyQueryHookResult = ReturnType<
  typeof useExchangeRatesLazyQuery
>;

export const DraftApplicationsListDocument = gql`
  query DraftApplicationsList {
    draftApplications {
      id
      applicationId
      url
      title
      conversionMetadata {
        status
        error
        timestamp
      }
      createdAt
    }
  }
`;

/**
 * __useDraftApplicationsListQuery__
 *
 * To run a query within a React component, call `useDraftApplicationsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useDraftApplicationsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDraftApplicationsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useDraftApplicationsListQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    DraftApplicationsListQuery,
    DraftApplicationsListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DraftApplicationsListQuery,
    DraftApplicationsListQueryVariables
  >(DraftApplicationsListDocument, options);
}
export function useDraftApplicationsListLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DraftApplicationsListQuery,
    DraftApplicationsListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DraftApplicationsListQuery,
    DraftApplicationsListQueryVariables
  >(DraftApplicationsListDocument, options);
}

export type DraftApplicationsListQueryHookResult = ReturnType<
  typeof useDraftApplicationsListQuery
>;
export type DraftApplicationsListLazyQueryHookResult = ReturnType<
  typeof useDraftApplicationsListLazyQuery
>;

export const DraftApplicationDetailDocument = gql`
  query DraftApplicationDetail($id: ID!) {
    draftApplication(id: $id) {
      id
      applicationId
      url
      title
      htmlContent
      conversionMetadata {
        status
        error
        timestamp
      }
      createdAt
      fit {
        id
        applicationId
        draftApplicationId
        resumeId
        generationMetadata {
          status
          error
          timestamp
        }
        scoreRatio
        classification
        fitCount
        gapCount
        unclearCount
        createdAt
      }
    }
  }
`;

/**
 * __useDraftApplicationDetailQuery__
 *
 * To run a query within a React component, call `useDraftApplicationDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useDraftApplicationDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDraftApplicationDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDraftApplicationDetailQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    DraftApplicationDetailQuery,
    DraftApplicationDetailQueryVariables
  > &
    (
      | { variables: DraftApplicationDetailQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DraftApplicationDetailQuery,
    DraftApplicationDetailQueryVariables
  >(DraftApplicationDetailDocument, options);
}
export function useDraftApplicationDetailLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DraftApplicationDetailQuery,
    DraftApplicationDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DraftApplicationDetailQuery,
    DraftApplicationDetailQueryVariables
  >(DraftApplicationDetailDocument, options);
}

export type DraftApplicationDetailQueryHookResult = ReturnType<
  typeof useDraftApplicationDetailQuery
>;
export type DraftApplicationDetailLazyQueryHookResult = ReturnType<
  typeof useDraftApplicationDetailLazyQuery
>;

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

/**
 * __useDeleteDraftApplicationMutation__
 *
 * To run a mutation, you first call `useDeleteDraftApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDraftApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDraftApplicationMutation, { data, loading, error }] = useDeleteDraftApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deleteLinkedApplication: // value for 'deleteLinkedApplication'
 *   },
 * });
 */
export function useDeleteDraftApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteDraftApplicationMutation,
    DeleteDraftApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteDraftApplicationMutation,
    DeleteDraftApplicationMutationVariables
  >(DeleteDraftApplicationDocument, options);
}

export const DeleteApplicationsForDraftDocument = gql`
  mutation DeleteApplicationsForDraft($draftId: ID!) {
    deleteApplicationsForDraft(draftId: $draftId) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteApplicationsForDraftMutation__
 *
 * To run a mutation, you first call `useDeleteApplicationsForDraftMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteApplicationsForDraftMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteApplicationsForDraftMutation, { data, loading, error }] = useDeleteApplicationsForDraftMutation({
 *   variables: {
 *      draftId: // value for 'draftId'
 *   },
 * });
 */
export function useDeleteApplicationsForDraftMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteApplicationsForDraftMutation,
    DeleteApplicationsForDraftMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteApplicationsForDraftMutation,
    DeleteApplicationsForDraftMutationVariables
  >(DeleteApplicationsForDraftDocument, options);
}

export const CreateApplicationWithAiDocument = gql`
  mutation CreateApplicationWithAI($draftId: ID!) {
    createApplicationWithAI(draftId: $draftId) {
      id
      title
      conversionMetadata {
        status
        error
      }
    }
  }
`;

/**
 * __useCreateApplicationWithAiMutation__
 *
 * To run a mutation, you first call `useCreateApplicationWithAiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationWithAiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationWithAiMutation, { data, loading, error }] = useCreateApplicationWithAiMutation({
 *   variables: {
 *      draftId: // value for 'draftId'
 *   },
 * });
 */
export function useCreateApplicationWithAiMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateApplicationWithAiMutation,
    CreateApplicationWithAiMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateApplicationWithAiMutation,
    CreateApplicationWithAiMutationVariables
  >(CreateApplicationWithAiDocument, options);
}

export const CreateDraftApplicationDocument = gql`
  mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {
    createDraftApplication(input: $input) {
      id
      applicationId
      url
      title
      conversionMetadata {
        status
        error
      }
    }
  }
`;

/**
 * __useCreateDraftApplicationMutation__
 *
 * To run a mutation, you first call `useCreateDraftApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDraftApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDraftApplicationMutation, { data, loading, error }] = useCreateDraftApplicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDraftApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateDraftApplicationMutation,
    CreateDraftApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateDraftApplicationMutation,
    CreateDraftApplicationMutationVariables
  >(CreateDraftApplicationDocument, options);
}

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
      conversionMetadata {
        status
        error
      }
    }
  }
`;

/**
 * __useUpdateDraftApplicationMutation__
 *
 * To run a mutation, you first call `useUpdateDraftApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDraftApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDraftApplicationMutation, { data, loading, error }] = useUpdateDraftApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDraftApplicationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateDraftApplicationMutation,
    UpdateDraftApplicationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateDraftApplicationMutation,
    UpdateDraftApplicationMutationVariables
  >(UpdateDraftApplicationDocument, options);
}

export const FitAnalysesListDocument = gql`
  query FitAnalysesList {
    fitAnalyses {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
      scoreRatio
      classification
      fitCount
      gapCount
      unclearCount
      createdAt
      updatedAt
      application {
        id
        title
        company {
          id
          name
        }
      }
      draftApplication {
        id
        title
      }
    }
  }
`;

/**
 * __useFitAnalysesListQuery__
 *
 * To run a query within a React component, call `useFitAnalysesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useFitAnalysesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFitAnalysesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useFitAnalysesListQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    FitAnalysesListQuery,
    FitAnalysesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    FitAnalysesListQuery,
    FitAnalysesListQueryVariables
  >(FitAnalysesListDocument, options);
}
export function useFitAnalysesListLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FitAnalysesListQuery,
    FitAnalysesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    FitAnalysesListQuery,
    FitAnalysesListQueryVariables
  >(FitAnalysesListDocument, options);
}

export type FitAnalysesListQueryHookResult = ReturnType<
  typeof useFitAnalysesListQuery
>;
export type FitAnalysesListLazyQueryHookResult = ReturnType<
  typeof useFitAnalysesListLazyQuery
>;

export const FitDocument = gql`
  query Fit($id: ID!) {
    fit(id: $id) {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
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
      application {
        id
        title
        company {
          id
          name
        }
      }
      draftApplication {
        id
        title
      }
    }
  }
`;

/**
 * __useFitQuery__
 *
 * To run a query within a React component, call `useFitQuery` and pass it any options that fit your needs.
 * When your component renders, `useFitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFitQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFitQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<FitQuery, FitQueryVariables> &
    ({ variables: FitQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<FitQuery, FitQueryVariables>(
    FitDocument,
    options,
  );
}
export function useFitLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FitQuery,
    FitQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<FitQuery, FitQueryVariables>(
    FitDocument,
    options,
  );
}

export type FitQueryHookResult = ReturnType<typeof useFitQuery>;
export type FitLazyQueryHookResult = ReturnType<typeof useFitLazyQuery>;

export const ApplicationFitDocument = gql`
  query ApplicationFit($applicationId: ID!) {
    applicationFit(applicationId: $applicationId) {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
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

/**
 * __useApplicationFitQuery__
 *
 * To run a query within a React component, call `useApplicationFitQuery` and pass it any options that fit your needs.
 * When your component renders, `useApplicationFitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApplicationFitQuery({
 *   variables: {
 *      applicationId: // value for 'applicationId'
 *   },
 * });
 */
export function useApplicationFitQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ApplicationFitQuery,
    ApplicationFitQueryVariables
  > &
    (
      | { variables: ApplicationFitQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ApplicationFitQuery,
    ApplicationFitQueryVariables
  >(ApplicationFitDocument, options);
}
export function useApplicationFitLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ApplicationFitQuery,
    ApplicationFitQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ApplicationFitQuery,
    ApplicationFitQueryVariables
  >(ApplicationFitDocument, options);
}

export type ApplicationFitQueryHookResult = ReturnType<
  typeof useApplicationFitQuery
>;
export type ApplicationFitLazyQueryHookResult = ReturnType<
  typeof useApplicationFitLazyQuery
>;

export const DraftApplicationFitDocument = gql`
  query DraftApplicationFit($draftApplicationId: ID!) {
    draftApplicationFit(draftApplicationId: $draftApplicationId) {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
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

/**
 * __useDraftApplicationFitQuery__
 *
 * To run a query within a React component, call `useDraftApplicationFitQuery` and pass it any options that fit your needs.
 * When your component renders, `useDraftApplicationFitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDraftApplicationFitQuery({
 *   variables: {
 *      draftApplicationId: // value for 'draftApplicationId'
 *   },
 * });
 */
export function useDraftApplicationFitQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    DraftApplicationFitQuery,
    DraftApplicationFitQueryVariables
  > &
    (
      | { variables: DraftApplicationFitQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DraftApplicationFitQuery,
    DraftApplicationFitQueryVariables
  >(DraftApplicationFitDocument, options);
}
export function useDraftApplicationFitLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DraftApplicationFitQuery,
    DraftApplicationFitQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DraftApplicationFitQuery,
    DraftApplicationFitQueryVariables
  >(DraftApplicationFitDocument, options);
}

export type DraftApplicationFitQueryHookResult = ReturnType<
  typeof useDraftApplicationFitQuery
>;
export type DraftApplicationFitLazyQueryHookResult = ReturnType<
  typeof useDraftApplicationFitLazyQuery
>;

export const GenerateApplicationFitDocument = gql`
  mutation GenerateApplicationFit($input: GenerateFitInput!) {
    generateApplicationFit(input: $input) {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
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

/**
 * __useGenerateApplicationFitMutation__
 *
 * To run a mutation, you first call `useGenerateApplicationFitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateApplicationFitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateApplicationFitMutation, { data, loading, error }] = useGenerateApplicationFitMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateApplicationFitMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    GenerateApplicationFitMutation,
    GenerateApplicationFitMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    GenerateApplicationFitMutation,
    GenerateApplicationFitMutationVariables
  >(GenerateApplicationFitDocument, options);
}

export const GenerateDraftApplicationFitDocument = gql`
  mutation GenerateDraftApplicationFit($input: GenerateDraftFitInput!) {
    generateDraftApplicationFit(input: $input) {
      id
      applicationId
      draftApplicationId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
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

/**
 * __useGenerateDraftApplicationFitMutation__
 *
 * To run a mutation, you first call `useGenerateDraftApplicationFitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateDraftApplicationFitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateDraftApplicationFitMutation, { data, loading, error }] = useGenerateDraftApplicationFitMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateDraftApplicationFitMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    GenerateDraftApplicationFitMutation,
    GenerateDraftApplicationFitMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    GenerateDraftApplicationFitMutation,
    GenerateDraftApplicationFitMutationVariables
  >(GenerateDraftApplicationFitDocument, options);
}

export const DeleteFitAnalysisDocument = gql`
  mutation DeleteFitAnalysis($id: ID!) {
    deleteFitAnalysis(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteFitAnalysisMutation__
 *
 * To run a mutation, you first call `useDeleteFitAnalysisMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFitAnalysisMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFitAnalysisMutation, { data, loading, error }] = useDeleteFitAnalysisMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFitAnalysisMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteFitAnalysisMutation,
    DeleteFitAnalysisMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteFitAnalysisMutation,
    DeleteFitAnalysisMutationVariables
  >(DeleteFitAnalysisDocument, options);
}

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

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    options,
  );
}
export function useMeLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    MeQuery,
    MeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    options,
  );
}

export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;

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

/**
 * __useResumesQuery__
 *
 * To run a query within a React component, call `useResumesQuery` and pass it any options that fit your needs.
 * When your component renders, `useResumesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResumesQuery({
 *   variables: {
 *   },
 * });
 */
export function useResumesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ResumesQuery,
    ResumesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ResumesQuery, ResumesQueryVariables>(
    ResumesDocument,
    options,
  );
}
export function useResumesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ResumesQuery,
    ResumesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<ResumesQuery, ResumesQueryVariables>(
    ResumesDocument,
    options,
  );
}

export type ResumesQueryHookResult = ReturnType<typeof useResumesQuery>;
export type ResumesLazyQueryHookResult = ReturnType<typeof useResumesLazyQuery>;

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

/**
 * __useResumeQuery__
 *
 * To run a query within a React component, call `useResumeQuery` and pass it any options that fit your needs.
 * When your component renders, `useResumeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResumeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useResumeQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ResumeQuery,
    ResumeQueryVariables
  > &
    ({ variables: ResumeQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ResumeQuery, ResumeQueryVariables>(
    ResumeDocument,
    options,
  );
}
export function useResumeLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ResumeQuery,
    ResumeQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<ResumeQuery, ResumeQueryVariables>(
    ResumeDocument,
    options,
  );
}

export type ResumeQueryHookResult = ReturnType<typeof useResumeQuery>;
export type ResumeLazyQueryHookResult = ReturnType<typeof useResumeLazyQuery>;

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

/**
 * __useCreateResumeMutation__
 *
 * To run a mutation, you first call `useCreateResumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateResumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createResumeMutation, { data, loading, error }] = useCreateResumeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateResumeMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateResumeMutation,
    CreateResumeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateResumeMutation,
    CreateResumeMutationVariables
  >(CreateResumeDocument, options);
}

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

/**
 * __useUpdateResumeMutation__
 *
 * To run a mutation, you first call `useUpdateResumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateResumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateResumeMutation, { data, loading, error }] = useUpdateResumeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateResumeMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateResumeMutation,
    UpdateResumeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateResumeMutation,
    UpdateResumeMutationVariables
  >(UpdateResumeDocument, options);
}

export const DeleteResumeDocument = gql`
  mutation DeleteResume($id: ID!) {
    deleteResume(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteResumeMutation__
 *
 * To run a mutation, you first call `useDeleteResumeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteResumeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteResumeMutation, { data, loading, error }] = useDeleteResumeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteResumeMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteResumeMutation,
    DeleteResumeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteResumeMutation,
    DeleteResumeMutationVariables
  >(DeleteResumeDocument, options);
}

export const SourceProfilesListDocument = gql`
  query SourceProfilesList {
    sourceProfiles(onlyWithSourceTemplate: true) {
      sourceProfileId
      name
    }
  }
`;

/**
 * __useSourceProfilesListQuery__
 *
 * To run a query within a React component, call `useSourceProfilesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourceProfilesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceProfilesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useSourceProfilesListQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    SourceProfilesListQuery,
    SourceProfilesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SourceProfilesListQuery,
    SourceProfilesListQueryVariables
  >(SourceProfilesListDocument, options);
}
export function useSourceProfilesListLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SourceProfilesListQuery,
    SourceProfilesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SourceProfilesListQuery,
    SourceProfilesListQueryVariables
  >(SourceProfilesListDocument, options);
}

export type SourceProfilesListQueryHookResult = ReturnType<
  typeof useSourceProfilesListQuery
>;
export type SourceProfilesListLazyQueryHookResult = ReturnType<
  typeof useSourceProfilesListLazyQuery
>;

export const SourceProfilesForNewSourcePickerDocument = gql`
  query SourceProfilesForNewSourcePicker {
    sourceProfiles(onlyWithSourceTemplate: false) {
      sourceProfileId
      name
    }
  }
`;

/**
 * __useSourceProfilesForNewSourcePickerQuery__
 *
 * To run a query within a React component, call `useSourceProfilesForNewSourcePickerQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourceProfilesForNewSourcePickerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceProfilesForNewSourcePickerQuery({
 *   variables: {
 *   },
 * });
 */
export function useSourceProfilesForNewSourcePickerQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    SourceProfilesForNewSourcePickerQuery,
    SourceProfilesForNewSourcePickerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SourceProfilesForNewSourcePickerQuery,
    SourceProfilesForNewSourcePickerQueryVariables
  >(SourceProfilesForNewSourcePickerDocument, options);
}
export function useSourceProfilesForNewSourcePickerLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SourceProfilesForNewSourcePickerQuery,
    SourceProfilesForNewSourcePickerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SourceProfilesForNewSourcePickerQuery,
    SourceProfilesForNewSourcePickerQueryVariables
  >(SourceProfilesForNewSourcePickerDocument, options);
}

export type SourceProfilesForNewSourcePickerQueryHookResult = ReturnType<
  typeof useSourceProfilesForNewSourcePickerQuery
>;
export type SourceProfilesForNewSourcePickerLazyQueryHookResult = ReturnType<
  typeof useSourceProfilesForNewSourcePickerLazyQuery
>;

export const SourcesForSourceProfileDocument = gql`
  query SourcesForSourceProfile($sourceProfileId: String!) {
    sourceTemplatesForSourceProfile(sourceProfileId: $sourceProfileId) {
      id
      sourceProfileId
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

/**
 * __useSourcesForSourceProfileQuery__
 *
 * To run a query within a React component, call `useSourcesForSourceProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourcesForSourceProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourcesForSourceProfileQuery({
 *   variables: {
 *      sourceProfileId: // value for 'sourceProfileId'
 *   },
 * });
 */
export function useSourcesForSourceProfileQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    SourcesForSourceProfileQuery,
    SourcesForSourceProfileQueryVariables
  > &
    (
      | { variables: SourcesForSourceProfileQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SourcesForSourceProfileQuery,
    SourcesForSourceProfileQueryVariables
  >(SourcesForSourceProfileDocument, options);
}
export function useSourcesForSourceProfileLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SourcesForSourceProfileQuery,
    SourcesForSourceProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SourcesForSourceProfileQuery,
    SourcesForSourceProfileQueryVariables
  >(SourcesForSourceProfileDocument, options);
}

export type SourcesForSourceProfileQueryHookResult = ReturnType<
  typeof useSourcesForSourceProfileQuery
>;
export type SourcesForSourceProfileLazyQueryHookResult = ReturnType<
  typeof useSourcesForSourceProfileLazyQuery
>;

export const UpdateSourceTemplateDocument = gql`
  mutation UpdateSourceTemplate($id: ID!, $input: UpdateSourceTemplateInput!) {
    updateSourceTemplate(id: $id, input: $input) {
      id
      sourceProfileId
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

/**
 * __useUpdateSourceTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateSourceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSourceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSourceTemplateMutation, { data, loading, error }] = useUpdateSourceTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSourceTemplateMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateSourceTemplateMutation,
    UpdateSourceTemplateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateSourceTemplateMutation,
    UpdateSourceTemplateMutationVariables
  >(UpdateSourceTemplateDocument, options);
}

export const DeleteSourceTemplateDocument = gql`
  mutation DeleteSourceTemplate($id: ID!) {
    deleteSourceTemplate(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteSourceTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteSourceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSourceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSourceTemplateMutation, { data, loading, error }] = useDeleteSourceTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSourceTemplateMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteSourceTemplateMutation,
    DeleteSourceTemplateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteSourceTemplateMutation,
    DeleteSourceTemplateMutationVariables
  >(DeleteSourceTemplateDocument, options);
}

export const CreateSourceTemplateDocument = gql`
  mutation CreateSourceTemplate($input: CreateSourceTemplateInput!) {
    createSourceTemplate(input: $input) {
      id
      sourceProfileId
      surfaceUrl
      scheduleCron
      scheduleEnabled
      createdAt
    }
  }
`;

/**
 * __useCreateSourceTemplateMutation__
 *
 * To run a mutation, you first call `useCreateSourceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSourceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSourceTemplateMutation, { data, loading, error }] = useCreateSourceTemplateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSourceTemplateMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateSourceTemplateMutation,
    CreateSourceTemplateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateSourceTemplateMutation,
    CreateSourceTemplateMutationVariables
  >(CreateSourceTemplateDocument, options);
}

export const WorkPreferencesDocument = gql`
  query WorkPreferences {
    workPreferences {
      text
      weight
    }
  }
`;

/**
 * __useWorkPreferencesQuery__
 *
 * To run a query within a React component, call `useWorkPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkPreferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkPreferencesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    WorkPreferencesQuery,
    WorkPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    WorkPreferencesQuery,
    WorkPreferencesQueryVariables
  >(WorkPreferencesDocument, options);
}
export function useWorkPreferencesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    WorkPreferencesQuery,
    WorkPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    WorkPreferencesQuery,
    WorkPreferencesQueryVariables
  >(WorkPreferencesDocument, options);
}

export type WorkPreferencesQueryHookResult = ReturnType<
  typeof useWorkPreferencesQuery
>;
export type WorkPreferencesLazyQueryHookResult = ReturnType<
  typeof useWorkPreferencesLazyQuery
>;

export const UpdateWorkPreferencesDocument = gql`
  mutation UpdateWorkPreferences($items: [PreferenceInput!]!) {
    updateWorkPreferences(items: $items) {
      text
      weight
    }
  }
`;

/**
 * __useUpdateWorkPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateWorkPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkPreferencesMutation, { data, loading, error }] = useUpdateWorkPreferencesMutation({
 *   variables: {
 *      items: // value for 'items'
 *   },
 * });
 */
export function useUpdateWorkPreferencesMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateWorkPreferencesMutation,
    UpdateWorkPreferencesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateWorkPreferencesMutation,
    UpdateWorkPreferencesMutationVariables
  >(UpdateWorkPreferencesDocument, options);
}
