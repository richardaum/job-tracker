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
  fit?: Maybe<FitAnalysisType>;
  id: Scalars["ID"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  salary: ApplicationSalary;
  source?: Maybe<ApplicationSource>;
  sourceRunId?: Maybe<Scalars["ID"]["output"]>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  urls: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
  workRegion?: Maybe<Scalars["String"]["output"]>;
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
  conversionError?: Maybe<Scalars["String"]["output"]>;
  conversionStatus: DraftApplicationConversionStatus;
  convertedAt?: Maybe<Scalars["DateTime"]["output"]>;
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

export enum FitAnalysisStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Processing = "PROCESSING",
}

export type FitAnalysisType = {
  __typename?: "FitAnalysisType";
  application?: Maybe<ApplicationType>;
  applicationId?: Maybe<Scalars["ID"]["output"]>;
  classification?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  draftApplication?: Maybe<DraftApplicationType>;
  draftApplicationId?: Maybe<Scalars["ID"]["output"]>;
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
  updateUserPreferences: Array<PreferenceType>;
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
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
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
      id: string;
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
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
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
      id: string;
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
    convertedAt?: any | null;
    createdAt: any;
    fit?: {
      __typename?: "FitAnalysisType";
      id: string;
      applicationId?: string | null;
      draftApplicationId?: string | null;
      resumeId: string;
      status: FitAnalysisStatus;
      error?: string | null;
      scoreRatio?: number | null;
      classification?: string | null;
      fitCount: number;
      gapCount: number;
      unclearCount: number;
      createdAt: any;
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

export type FitAnalysesListQueryVariables = Exact<{ [key: string]: never }>;

export type FitAnalysesListQuery = {
  __typename?: "Query";
  fitAnalyses: Array<{
    __typename?: "FitAnalysisType";
    id: string;
    applicationId?: string | null;
    draftApplicationId?: string | null;
    resumeId: string;
    status: FitAnalysisStatus;
    error?: string | null;
    scoreRatio?: number | null;
    classification?: string | null;
    fitCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    updatedAt: any;
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
    applicationId?: string | null;
    draftApplicationId?: string | null;
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
      location
      workRegion
      sourceRunId
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
        status
        error
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
// @ts-ignore
export function useApplicationsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ApplicationsQuery,
    ApplicationsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationsQuery,
  ApplicationsQueryVariables
>;
export function useApplicationsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationsQuery,
        ApplicationsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationsQuery | undefined,
  ApplicationsQueryVariables
>;
export function useApplicationsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationsQuery,
        ApplicationsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type ApplicationsSuspenseQueryHookResult = ReturnType<
  typeof useApplicationsSuspenseQuery
>;
export type ApplicationsQueryResult = Apollo.QueryResult<
  ApplicationsQuery,
  ApplicationsQueryVariables
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
        status
        error
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
// @ts-ignore
export function useApplicationSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ApplicationQuery,
    ApplicationQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationQuery,
  ApplicationQueryVariables
>;
export function useApplicationSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationQuery,
        ApplicationQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationQuery | undefined,
  ApplicationQueryVariables
>;
export function useApplicationSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationQuery,
        ApplicationQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    ApplicationQuery,
    ApplicationQueryVariables
  >(ApplicationDocument, options);
}
export type ApplicationQueryHookResult = ReturnType<typeof useApplicationQuery>;
export type ApplicationLazyQueryHookResult = ReturnType<
  typeof useApplicationLazyQuery
>;
export type ApplicationSuspenseQueryHookResult = ReturnType<
  typeof useApplicationSuspenseQuery
>;
export type ApplicationQueryResult = Apollo.QueryResult<
  ApplicationQuery,
  ApplicationQueryVariables
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
export type CreateApplicationMutationFn = Apollo.MutationFunction<
  CreateApplicationMutation,
  CreateApplicationMutationVariables
>;

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
export type CreateApplicationMutationHookResult = ReturnType<
  typeof useCreateApplicationMutation
>;
export type CreateApplicationMutationResult =
  Apollo.MutationResult<CreateApplicationMutation>;
export type CreateApplicationMutationOptions = Apollo.BaseMutationOptions<
  CreateApplicationMutation,
  CreateApplicationMutationVariables
>;
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
// @ts-ignore
export function useGenerateCompanyDescriptionSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GenerateCompanyDescriptionQuery,
    GenerateCompanyDescriptionQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateCompanyDescriptionQuery,
  GenerateCompanyDescriptionQueryVariables
>;
export function useGenerateCompanyDescriptionSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateCompanyDescriptionQuery,
        GenerateCompanyDescriptionQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateCompanyDescriptionQuery | undefined,
  GenerateCompanyDescriptionQueryVariables
>;
export function useGenerateCompanyDescriptionSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateCompanyDescriptionQuery,
        GenerateCompanyDescriptionQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type GenerateCompanyDescriptionSuspenseQueryHookResult = ReturnType<
  typeof useGenerateCompanyDescriptionSuspenseQuery
>;
export type GenerateCompanyDescriptionQueryResult = Apollo.QueryResult<
  GenerateCompanyDescriptionQuery,
  GenerateCompanyDescriptionQueryVariables
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
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;
export type UpdateApplicationMutationFn = Apollo.MutationFunction<
  UpdateApplicationMutation,
  UpdateApplicationMutationVariables
>;

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
export type UpdateApplicationMutationHookResult = ReturnType<
  typeof useUpdateApplicationMutation
>;
export type UpdateApplicationMutationResult =
  Apollo.MutationResult<UpdateApplicationMutation>;
export type UpdateApplicationMutationOptions = Apollo.BaseMutationOptions<
  UpdateApplicationMutation,
  UpdateApplicationMutationVariables
>;
export const RemoveApplicationTagDocument = gql`
  mutation RemoveApplicationTag($id: ID!, $tag: String!) {
    removeApplicationTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;
export type RemoveApplicationTagMutationFn = Apollo.MutationFunction<
  RemoveApplicationTagMutation,
  RemoveApplicationTagMutationVariables
>;

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
export type RemoveApplicationTagMutationHookResult = ReturnType<
  typeof useRemoveApplicationTagMutation
>;
export type RemoveApplicationTagMutationResult =
  Apollo.MutationResult<RemoveApplicationTagMutation>;
export type RemoveApplicationTagMutationOptions = Apollo.BaseMutationOptions<
  RemoveApplicationTagMutation,
  RemoveApplicationTagMutationVariables
>;
export const DeleteApplicationDocument = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteApplicationMutationFn = Apollo.MutationFunction<
  DeleteApplicationMutation,
  DeleteApplicationMutationVariables
>;

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
export type DeleteApplicationMutationHookResult = ReturnType<
  typeof useDeleteApplicationMutation
>;
export type DeleteApplicationMutationResult =
  Apollo.MutationResult<DeleteApplicationMutation>;
export type DeleteApplicationMutationOptions = Apollo.BaseMutationOptions<
  DeleteApplicationMutation,
  DeleteApplicationMutationVariables
>;
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
// @ts-ignore
export function useApplicationStageEventsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ApplicationStageEventsQuery,
    ApplicationStageEventsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationStageEventsQuery,
  ApplicationStageEventsQueryVariables
>;
export function useApplicationStageEventsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationStageEventsQuery,
        ApplicationStageEventsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationStageEventsQuery | undefined,
  ApplicationStageEventsQueryVariables
>;
export function useApplicationStageEventsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationStageEventsQuery,
        ApplicationStageEventsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type ApplicationStageEventsSuspenseQueryHookResult = ReturnType<
  typeof useApplicationStageEventsSuspenseQuery
>;
export type ApplicationStageEventsQueryResult = Apollo.QueryResult<
  ApplicationStageEventsQuery,
  ApplicationStageEventsQueryVariables
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
export type CreateApplicationStageEventMutationFn = Apollo.MutationFunction<
  CreateApplicationStageEventMutation,
  CreateApplicationStageEventMutationVariables
>;

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
export type CreateApplicationStageEventMutationHookResult = ReturnType<
  typeof useCreateApplicationStageEventMutation
>;
export type CreateApplicationStageEventMutationResult =
  Apollo.MutationResult<CreateApplicationStageEventMutation>;
export type CreateApplicationStageEventMutationOptions =
  Apollo.BaseMutationOptions<
    CreateApplicationStageEventMutation,
    CreateApplicationStageEventMutationVariables
  >;
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
export type UpdateApplicationStageEventMutationFn = Apollo.MutationFunction<
  UpdateApplicationStageEventMutation,
  UpdateApplicationStageEventMutationVariables
>;

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
export type UpdateApplicationStageEventMutationHookResult = ReturnType<
  typeof useUpdateApplicationStageEventMutation
>;
export type UpdateApplicationStageEventMutationResult =
  Apollo.MutationResult<UpdateApplicationStageEventMutation>;
export type UpdateApplicationStageEventMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateApplicationStageEventMutation,
    UpdateApplicationStageEventMutationVariables
  >;
export const DeleteApplicationStageEventDocument = gql`
  mutation DeleteApplicationStageEvent($id: ID!) {
    deleteApplicationStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteApplicationStageEventMutationFn = Apollo.MutationFunction<
  DeleteApplicationStageEventMutation,
  DeleteApplicationStageEventMutationVariables
>;

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
export type DeleteApplicationStageEventMutationHookResult = ReturnType<
  typeof useDeleteApplicationStageEventMutation
>;
export type DeleteApplicationStageEventMutationResult =
  Apollo.MutationResult<DeleteApplicationStageEventMutation>;
export type DeleteApplicationStageEventMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteApplicationStageEventMutation,
    DeleteApplicationStageEventMutationVariables
  >;
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
// @ts-ignore
export function useApplicationNotesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ApplicationNotesQuery,
    ApplicationNotesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationNotesQuery,
  ApplicationNotesQueryVariables
>;
export function useApplicationNotesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationNotesQuery,
        ApplicationNotesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationNotesQuery | undefined,
  ApplicationNotesQueryVariables
>;
export function useApplicationNotesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationNotesQuery,
        ApplicationNotesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type ApplicationNotesSuspenseQueryHookResult = ReturnType<
  typeof useApplicationNotesSuspenseQuery
>;
export type ApplicationNotesQueryResult = Apollo.QueryResult<
  ApplicationNotesQuery,
  ApplicationNotesQueryVariables
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
export type CreateApplicationNoteMutationFn = Apollo.MutationFunction<
  CreateApplicationNoteMutation,
  CreateApplicationNoteMutationVariables
>;

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
export type CreateApplicationNoteMutationHookResult = ReturnType<
  typeof useCreateApplicationNoteMutation
>;
export type CreateApplicationNoteMutationResult =
  Apollo.MutationResult<CreateApplicationNoteMutation>;
export type CreateApplicationNoteMutationOptions = Apollo.BaseMutationOptions<
  CreateApplicationNoteMutation,
  CreateApplicationNoteMutationVariables
>;
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
export type UpdateApplicationNoteMutationFn = Apollo.MutationFunction<
  UpdateApplicationNoteMutation,
  UpdateApplicationNoteMutationVariables
>;

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
export type UpdateApplicationNoteMutationHookResult = ReturnType<
  typeof useUpdateApplicationNoteMutation
>;
export type UpdateApplicationNoteMutationResult =
  Apollo.MutationResult<UpdateApplicationNoteMutation>;
export type UpdateApplicationNoteMutationOptions = Apollo.BaseMutationOptions<
  UpdateApplicationNoteMutation,
  UpdateApplicationNoteMutationVariables
>;
export const DeleteApplicationNoteDocument = gql`
  mutation DeleteApplicationNote($id: ID!) {
    deleteApplicationNote(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteApplicationNoteMutationFn = Apollo.MutationFunction<
  DeleteApplicationNoteMutation,
  DeleteApplicationNoteMutationVariables
>;

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
export type DeleteApplicationNoteMutationHookResult = ReturnType<
  typeof useDeleteApplicationNoteMutation
>;
export type DeleteApplicationNoteMutationResult =
  Apollo.MutationResult<DeleteApplicationNoteMutation>;
export type DeleteApplicationNoteMutationOptions = Apollo.BaseMutationOptions<
  DeleteApplicationNoteMutation,
  DeleteApplicationNoteMutationVariables
>;
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
// @ts-ignore
export function useGenerateApplicationNoteWithAiSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GenerateApplicationNoteWithAiQuery,
    GenerateApplicationNoteWithAiQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationNoteWithAiQuery,
  GenerateApplicationNoteWithAiQueryVariables
>;
export function useGenerateApplicationNoteWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationNoteWithAiQuery,
        GenerateApplicationNoteWithAiQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationNoteWithAiQuery | undefined,
  GenerateApplicationNoteWithAiQueryVariables
>;
export function useGenerateApplicationNoteWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationNoteWithAiQuery,
        GenerateApplicationNoteWithAiQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type GenerateApplicationNoteWithAiSuspenseQueryHookResult = ReturnType<
  typeof useGenerateApplicationNoteWithAiSuspenseQuery
>;
export type GenerateApplicationNoteWithAiQueryResult = Apollo.QueryResult<
  GenerateApplicationNoteWithAiQuery,
  GenerateApplicationNoteWithAiQueryVariables
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
// @ts-ignore
export function useRewriteTextWithAiSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    RewriteTextWithAiQuery,
    RewriteTextWithAiQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  RewriteTextWithAiQuery,
  RewriteTextWithAiQueryVariables
>;
export function useRewriteTextWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        RewriteTextWithAiQuery,
        RewriteTextWithAiQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  RewriteTextWithAiQuery | undefined,
  RewriteTextWithAiQueryVariables
>;
export function useRewriteTextWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        RewriteTextWithAiQuery,
        RewriteTextWithAiQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type RewriteTextWithAiSuspenseQueryHookResult = ReturnType<
  typeof useRewriteTextWithAiSuspenseQuery
>;
export type RewriteTextWithAiQueryResult = Apollo.QueryResult<
  RewriteTextWithAiQuery,
  RewriteTextWithAiQueryVariables
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
// @ts-ignore
export function useRestructureJobDescriptionWithAiSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    RestructureJobDescriptionWithAiQuery,
    RestructureJobDescriptionWithAiQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  RestructureJobDescriptionWithAiQuery,
  RestructureJobDescriptionWithAiQueryVariables
>;
export function useRestructureJobDescriptionWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        RestructureJobDescriptionWithAiQuery,
        RestructureJobDescriptionWithAiQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  RestructureJobDescriptionWithAiQuery | undefined,
  RestructureJobDescriptionWithAiQueryVariables
>;
export function useRestructureJobDescriptionWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        RestructureJobDescriptionWithAiQuery,
        RestructureJobDescriptionWithAiQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type RestructureJobDescriptionWithAiSuspenseQueryHookResult = ReturnType<
  typeof useRestructureJobDescriptionWithAiSuspenseQuery
>;
export type RestructureJobDescriptionWithAiQueryResult = Apollo.QueryResult<
  RestructureJobDescriptionWithAiQuery,
  RestructureJobDescriptionWithAiQueryVariables
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
// @ts-ignore
export function useGenerateApplicationLocationWithAiSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GenerateApplicationLocationWithAiQuery,
    GenerateApplicationLocationWithAiQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationLocationWithAiQuery,
  GenerateApplicationLocationWithAiQueryVariables
>;
export function useGenerateApplicationLocationWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationLocationWithAiQuery,
        GenerateApplicationLocationWithAiQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationLocationWithAiQuery | undefined,
  GenerateApplicationLocationWithAiQueryVariables
>;
export function useGenerateApplicationLocationWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationLocationWithAiQuery,
        GenerateApplicationLocationWithAiQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type GenerateApplicationLocationWithAiSuspenseQueryHookResult =
  ReturnType<typeof useGenerateApplicationLocationWithAiSuspenseQuery>;
export type GenerateApplicationLocationWithAiQueryResult = Apollo.QueryResult<
  GenerateApplicationLocationWithAiQuery,
  GenerateApplicationLocationWithAiQueryVariables
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
// @ts-ignore
export function useGenerateApplicationWorkRegionWithAiSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    GenerateApplicationWorkRegionWithAiQuery,
    GenerateApplicationWorkRegionWithAiQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationWorkRegionWithAiQuery,
  GenerateApplicationWorkRegionWithAiQueryVariables
>;
export function useGenerateApplicationWorkRegionWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationWorkRegionWithAiQuery,
        GenerateApplicationWorkRegionWithAiQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  GenerateApplicationWorkRegionWithAiQuery | undefined,
  GenerateApplicationWorkRegionWithAiQueryVariables
>;
export function useGenerateApplicationWorkRegionWithAiSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GenerateApplicationWorkRegionWithAiQuery,
        GenerateApplicationWorkRegionWithAiQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type GenerateApplicationWorkRegionWithAiSuspenseQueryHookResult =
  ReturnType<typeof useGenerateApplicationWorkRegionWithAiSuspenseQuery>;
export type GenerateApplicationWorkRegionWithAiQueryResult = Apollo.QueryResult<
  GenerateApplicationWorkRegionWithAiQuery,
  GenerateApplicationWorkRegionWithAiQueryVariables
>;
export const UpdateCompanyDocument = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;
export type UpdateCompanyMutationFn = Apollo.MutationFunction<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;

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
export type UpdateCompanyMutationHookResult = ReturnType<
  typeof useUpdateCompanyMutation
>;
export type UpdateCompanyMutationResult =
  Apollo.MutationResult<UpdateCompanyMutation>;
export type UpdateCompanyMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;
export const DeleteCompanyDocument = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteCompanyMutationFn = Apollo.MutationFunction<
  DeleteCompanyMutation,
  DeleteCompanyMutationVariables
>;

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
export type DeleteCompanyMutationHookResult = ReturnType<
  typeof useDeleteCompanyMutation
>;
export type DeleteCompanyMutationResult =
  Apollo.MutationResult<DeleteCompanyMutation>;
export type DeleteCompanyMutationOptions = Apollo.BaseMutationOptions<
  DeleteCompanyMutation,
  DeleteCompanyMutationVariables
>;
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
// @ts-ignore
export function useCompanyApplicationsCountSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    CompanyApplicationsCountQuery,
    CompanyApplicationsCountQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CompanyApplicationsCountQuery,
  CompanyApplicationsCountQueryVariables
>;
export function useCompanyApplicationsCountSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CompanyApplicationsCountQuery,
        CompanyApplicationsCountQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CompanyApplicationsCountQuery | undefined,
  CompanyApplicationsCountQueryVariables
>;
export function useCompanyApplicationsCountSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CompanyApplicationsCountQuery,
        CompanyApplicationsCountQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type CompanyApplicationsCountSuspenseQueryHookResult = ReturnType<
  typeof useCompanyApplicationsCountSuspenseQuery
>;
export type CompanyApplicationsCountQueryResult = Apollo.QueryResult<
  CompanyApplicationsCountQuery,
  CompanyApplicationsCountQueryVariables
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
// @ts-ignore
export function useCompaniesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    CompaniesQuery,
    CompaniesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CompaniesQuery,
  CompaniesQueryVariables
>;
export function useCompaniesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CompaniesQuery,
        CompaniesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CompaniesQuery | undefined,
  CompaniesQueryVariables
>;
export function useCompaniesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CompaniesQuery,
        CompaniesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    CompaniesQuery,
    CompaniesQueryVariables
  >(CompaniesDocument, options);
}
export type CompaniesQueryHookResult = ReturnType<typeof useCompaniesQuery>;
export type CompaniesLazyQueryHookResult = ReturnType<
  typeof useCompaniesLazyQuery
>;
export type CompaniesSuspenseQueryHookResult = ReturnType<
  typeof useCompaniesSuspenseQuery
>;
export type CompaniesQueryResult = Apollo.QueryResult<
  CompaniesQuery,
  CompaniesQueryVariables
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
// @ts-ignore
export function useExchangeRatesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ExchangeRatesQuery,
    ExchangeRatesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExchangeRatesQuery,
  ExchangeRatesQueryVariables
>;
export function useExchangeRatesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExchangeRatesQuery,
        ExchangeRatesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExchangeRatesQuery | undefined,
  ExchangeRatesQueryVariables
>;
export function useExchangeRatesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExchangeRatesQuery,
        ExchangeRatesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type ExchangeRatesSuspenseQueryHookResult = ReturnType<
  typeof useExchangeRatesSuspenseQuery
>;
export type ExchangeRatesQueryResult = Apollo.QueryResult<
  ExchangeRatesQuery,
  ExchangeRatesQueryVariables
>;
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
// @ts-ignore
export function useDraftApplicationsListSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DraftApplicationsListQuery,
    DraftApplicationsListQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationsListQuery,
  DraftApplicationsListQueryVariables
>;
export function useDraftApplicationsListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationsListQuery,
        DraftApplicationsListQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationsListQuery | undefined,
  DraftApplicationsListQueryVariables
>;
export function useDraftApplicationsListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationsListQuery,
        DraftApplicationsListQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type DraftApplicationsListSuspenseQueryHookResult = ReturnType<
  typeof useDraftApplicationsListSuspenseQuery
>;
export type DraftApplicationsListQueryResult = Apollo.QueryResult<
  DraftApplicationsListQuery,
  DraftApplicationsListQueryVariables
>;
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
      convertedAt
      createdAt
      fit {
        id
        applicationId
        draftApplicationId
        resumeId
        status
        error
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
// @ts-ignore
export function useDraftApplicationDetailSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DraftApplicationDetailQuery,
    DraftApplicationDetailQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationDetailQuery,
  DraftApplicationDetailQueryVariables
>;
export function useDraftApplicationDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationDetailQuery,
        DraftApplicationDetailQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationDetailQuery | undefined,
  DraftApplicationDetailQueryVariables
>;
export function useDraftApplicationDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationDetailQuery,
        DraftApplicationDetailQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type DraftApplicationDetailSuspenseQueryHookResult = ReturnType<
  typeof useDraftApplicationDetailSuspenseQuery
>;
export type DraftApplicationDetailQueryResult = Apollo.QueryResult<
  DraftApplicationDetailQuery,
  DraftApplicationDetailQueryVariables
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
export type DeleteDraftApplicationMutationFn = Apollo.MutationFunction<
  DeleteDraftApplicationMutation,
  DeleteDraftApplicationMutationVariables
>;

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
export type DeleteDraftApplicationMutationHookResult = ReturnType<
  typeof useDeleteDraftApplicationMutation
>;
export type DeleteDraftApplicationMutationResult =
  Apollo.MutationResult<DeleteDraftApplicationMutation>;
export type DeleteDraftApplicationMutationOptions = Apollo.BaseMutationOptions<
  DeleteDraftApplicationMutation,
  DeleteDraftApplicationMutationVariables
>;
export const DeleteApplicationsForDraftDocument = gql`
  mutation DeleteApplicationsForDraft($draftId: ID!) {
    deleteApplicationsForDraft(draftId: $draftId) {
      success
      deletedId
    }
  }
`;
export type DeleteApplicationsForDraftMutationFn = Apollo.MutationFunction<
  DeleteApplicationsForDraftMutation,
  DeleteApplicationsForDraftMutationVariables
>;

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
export type DeleteApplicationsForDraftMutationHookResult = ReturnType<
  typeof useDeleteApplicationsForDraftMutation
>;
export type DeleteApplicationsForDraftMutationResult =
  Apollo.MutationResult<DeleteApplicationsForDraftMutation>;
export type DeleteApplicationsForDraftMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteApplicationsForDraftMutation,
    DeleteApplicationsForDraftMutationVariables
  >;
export const CreateApplicationWithAiDocument = gql`
  mutation CreateApplicationWithAI($draftId: ID!) {
    createApplicationWithAI(draftId: $draftId) {
      id
      title
      conversionStatus
      conversionError
    }
  }
`;
export type CreateApplicationWithAiMutationFn = Apollo.MutationFunction<
  CreateApplicationWithAiMutation,
  CreateApplicationWithAiMutationVariables
>;

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
export type CreateApplicationWithAiMutationHookResult = ReturnType<
  typeof useCreateApplicationWithAiMutation
>;
export type CreateApplicationWithAiMutationResult =
  Apollo.MutationResult<CreateApplicationWithAiMutation>;
export type CreateApplicationWithAiMutationOptions = Apollo.BaseMutationOptions<
  CreateApplicationWithAiMutation,
  CreateApplicationWithAiMutationVariables
>;
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
export type CreateDraftApplicationMutationFn = Apollo.MutationFunction<
  CreateDraftApplicationMutation,
  CreateDraftApplicationMutationVariables
>;

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
export type CreateDraftApplicationMutationHookResult = ReturnType<
  typeof useCreateDraftApplicationMutation
>;
export type CreateDraftApplicationMutationResult =
  Apollo.MutationResult<CreateDraftApplicationMutation>;
export type CreateDraftApplicationMutationOptions = Apollo.BaseMutationOptions<
  CreateDraftApplicationMutation,
  CreateDraftApplicationMutationVariables
>;
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
export type UpdateDraftApplicationMutationFn = Apollo.MutationFunction<
  UpdateDraftApplicationMutation,
  UpdateDraftApplicationMutationVariables
>;

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
export type UpdateDraftApplicationMutationHookResult = ReturnType<
  typeof useUpdateDraftApplicationMutation
>;
export type UpdateDraftApplicationMutationResult =
  Apollo.MutationResult<UpdateDraftApplicationMutation>;
export type UpdateDraftApplicationMutationOptions = Apollo.BaseMutationOptions<
  UpdateDraftApplicationMutation,
  UpdateDraftApplicationMutationVariables
>;
export const FitAnalysesListDocument = gql`
  query FitAnalysesList {
    fitAnalyses {
      id
      applicationId
      draftApplicationId
      resumeId
      status
      error
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
// @ts-ignore
export function useFitAnalysesListSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FitAnalysesListQuery,
    FitAnalysesListQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FitAnalysesListQuery,
  FitAnalysesListQueryVariables
>;
export function useFitAnalysesListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FitAnalysesListQuery,
        FitAnalysesListQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FitAnalysesListQuery | undefined,
  FitAnalysesListQueryVariables
>;
export function useFitAnalysesListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FitAnalysesListQuery,
        FitAnalysesListQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type FitAnalysesListSuspenseQueryHookResult = ReturnType<
  typeof useFitAnalysesListSuspenseQuery
>;
export type FitAnalysesListQueryResult = Apollo.QueryResult<
  FitAnalysesListQuery,
  FitAnalysesListQueryVariables
>;
export const FitDocument = gql`
  query Fit($id: ID!) {
    fit(id: $id) {
      id
      applicationId
      draftApplicationId
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
// @ts-ignore
export function useFitSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FitQuery,
    FitQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<FitQuery, FitQueryVariables>;
export function useFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<FitQuery, FitQueryVariables>,
): ApolloReactHooks.UseSuspenseQueryResult<
  FitQuery | undefined,
  FitQueryVariables
>;
export function useFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<FitQuery, FitQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<FitQuery, FitQueryVariables>(
    FitDocument,
    options,
  );
}
export type FitQueryHookResult = ReturnType<typeof useFitQuery>;
export type FitLazyQueryHookResult = ReturnType<typeof useFitLazyQuery>;
export type FitSuspenseQueryHookResult = ReturnType<typeof useFitSuspenseQuery>;
export type FitQueryResult = Apollo.QueryResult<FitQuery, FitQueryVariables>;
export const ApplicationFitDocument = gql`
  query ApplicationFit($applicationId: ID!) {
    applicationFit(applicationId: $applicationId) {
      id
      applicationId
      draftApplicationId
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
// @ts-ignore
export function useApplicationFitSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ApplicationFitQuery,
    ApplicationFitQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationFitQuery,
  ApplicationFitQueryVariables
>;
export function useApplicationFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationFitQuery,
        ApplicationFitQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ApplicationFitQuery | undefined,
  ApplicationFitQueryVariables
>;
export function useApplicationFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ApplicationFitQuery,
        ApplicationFitQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type ApplicationFitSuspenseQueryHookResult = ReturnType<
  typeof useApplicationFitSuspenseQuery
>;
export type ApplicationFitQueryResult = Apollo.QueryResult<
  ApplicationFitQuery,
  ApplicationFitQueryVariables
>;
export const DraftApplicationFitDocument = gql`
  query DraftApplicationFit($draftApplicationId: ID!) {
    draftApplicationFit(draftApplicationId: $draftApplicationId) {
      id
      applicationId
      draftApplicationId
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
// @ts-ignore
export function useDraftApplicationFitSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DraftApplicationFitQuery,
    DraftApplicationFitQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationFitQuery,
  DraftApplicationFitQueryVariables
>;
export function useDraftApplicationFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationFitQuery,
        DraftApplicationFitQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DraftApplicationFitQuery | undefined,
  DraftApplicationFitQueryVariables
>;
export function useDraftApplicationFitSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DraftApplicationFitQuery,
        DraftApplicationFitQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type DraftApplicationFitSuspenseQueryHookResult = ReturnType<
  typeof useDraftApplicationFitSuspenseQuery
>;
export type DraftApplicationFitQueryResult = Apollo.QueryResult<
  DraftApplicationFitQuery,
  DraftApplicationFitQueryVariables
>;
export const GenerateApplicationFitDocument = gql`
  mutation GenerateApplicationFit($input: GenerateFitInput!) {
    generateApplicationFit(input: $input) {
      id
      applicationId
      draftApplicationId
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
export type GenerateApplicationFitMutationFn = Apollo.MutationFunction<
  GenerateApplicationFitMutation,
  GenerateApplicationFitMutationVariables
>;

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
export type GenerateApplicationFitMutationHookResult = ReturnType<
  typeof useGenerateApplicationFitMutation
>;
export type GenerateApplicationFitMutationResult =
  Apollo.MutationResult<GenerateApplicationFitMutation>;
export type GenerateApplicationFitMutationOptions = Apollo.BaseMutationOptions<
  GenerateApplicationFitMutation,
  GenerateApplicationFitMutationVariables
>;
export const DeleteFitAnalysisDocument = gql`
  mutation DeleteFitAnalysis($id: ID!) {
    deleteFitAnalysis(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteFitAnalysisMutationFn = Apollo.MutationFunction<
  DeleteFitAnalysisMutation,
  DeleteFitAnalysisMutationVariables
>;

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
export type DeleteFitAnalysisMutationHookResult = ReturnType<
  typeof useDeleteFitAnalysisMutation
>;
export type DeleteFitAnalysisMutationResult =
  Apollo.MutationResult<DeleteFitAnalysisMutation>;
export type DeleteFitAnalysisMutationOptions = Apollo.BaseMutationOptions<
  DeleteFitAnalysisMutation,
  DeleteFitAnalysisMutationVariables
>;
export const GenerateDraftApplicationFitDocument = gql`
  mutation GenerateDraftApplicationFit($input: GenerateDraftFitInput!) {
    generateDraftApplicationFit(input: $input) {
      id
      applicationId
      draftApplicationId
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
export type GenerateDraftApplicationFitMutationFn = Apollo.MutationFunction<
  GenerateDraftApplicationFitMutation,
  GenerateDraftApplicationFitMutationVariables
>;

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
export type GenerateDraftApplicationFitMutationHookResult = ReturnType<
  typeof useGenerateDraftApplicationFitMutation
>;
export type GenerateDraftApplicationFitMutationResult =
  Apollo.MutationResult<GenerateDraftApplicationFitMutation>;
export type GenerateDraftApplicationFitMutationOptions =
  Apollo.BaseMutationOptions<
    GenerateDraftApplicationFitMutation,
    GenerateDraftApplicationFitMutationVariables
  >;
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
// @ts-ignore
export function useMeSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    MeQuery,
    MeQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
): ApolloReactHooks.UseSuspenseQueryResult<
  MeQuery | undefined,
  MeQueryVariables
>;
export function useMeSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<MeQuery, MeQueryVariables>(
    MeDocument,
    options,
  );
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
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
// @ts-ignore
export function useResumesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ResumesQuery,
    ResumesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<ResumesQuery, ResumesQueryVariables>;
export function useResumesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ResumesQuery,
        ResumesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ResumesQuery | undefined,
  ResumesQueryVariables
>;
export function useResumesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ResumesQuery,
        ResumesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<ResumesQuery, ResumesQueryVariables>(
    ResumesDocument,
    options,
  );
}
export type ResumesQueryHookResult = ReturnType<typeof useResumesQuery>;
export type ResumesLazyQueryHookResult = ReturnType<typeof useResumesLazyQuery>;
export type ResumesSuspenseQueryHookResult = ReturnType<
  typeof useResumesSuspenseQuery
>;
export type ResumesQueryResult = Apollo.QueryResult<
  ResumesQuery,
  ResumesQueryVariables
>;
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
// @ts-ignore
export function useResumeSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ResumeQuery,
    ResumeQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<ResumeQuery, ResumeQueryVariables>;
export function useResumeSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ResumeQuery,
        ResumeQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ResumeQuery | undefined,
  ResumeQueryVariables
>;
export function useResumeSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ResumeQuery,
        ResumeQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<ResumeQuery, ResumeQueryVariables>(
    ResumeDocument,
    options,
  );
}
export type ResumeQueryHookResult = ReturnType<typeof useResumeQuery>;
export type ResumeLazyQueryHookResult = ReturnType<typeof useResumeLazyQuery>;
export type ResumeSuspenseQueryHookResult = ReturnType<
  typeof useResumeSuspenseQuery
>;
export type ResumeQueryResult = Apollo.QueryResult<
  ResumeQuery,
  ResumeQueryVariables
>;
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
export type CreateResumeMutationFn = Apollo.MutationFunction<
  CreateResumeMutation,
  CreateResumeMutationVariables
>;

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
export type CreateResumeMutationHookResult = ReturnType<
  typeof useCreateResumeMutation
>;
export type CreateResumeMutationResult =
  Apollo.MutationResult<CreateResumeMutation>;
export type CreateResumeMutationOptions = Apollo.BaseMutationOptions<
  CreateResumeMutation,
  CreateResumeMutationVariables
>;
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
export type UpdateResumeMutationFn = Apollo.MutationFunction<
  UpdateResumeMutation,
  UpdateResumeMutationVariables
>;

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
export type UpdateResumeMutationHookResult = ReturnType<
  typeof useUpdateResumeMutation
>;
export type UpdateResumeMutationResult =
  Apollo.MutationResult<UpdateResumeMutation>;
export type UpdateResumeMutationOptions = Apollo.BaseMutationOptions<
  UpdateResumeMutation,
  UpdateResumeMutationVariables
>;
export const DeleteResumeDocument = gql`
  mutation DeleteResume($id: ID!) {
    deleteResume(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteResumeMutationFn = Apollo.MutationFunction<
  DeleteResumeMutation,
  DeleteResumeMutationVariables
>;

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
export type DeleteResumeMutationHookResult = ReturnType<
  typeof useDeleteResumeMutation
>;
export type DeleteResumeMutationResult =
  Apollo.MutationResult<DeleteResumeMutation>;
export type DeleteResumeMutationOptions = Apollo.BaseMutationOptions<
  DeleteResumeMutation,
  DeleteResumeMutationVariables
>;
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
// @ts-ignore
export function useSourceProfilesListSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SourceProfilesListQuery,
    SourceProfilesListQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourceProfilesListQuery,
  SourceProfilesListQueryVariables
>;
export function useSourceProfilesListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourceProfilesListQuery,
        SourceProfilesListQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourceProfilesListQuery | undefined,
  SourceProfilesListQueryVariables
>;
export function useSourceProfilesListSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourceProfilesListQuery,
        SourceProfilesListQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type SourceProfilesListSuspenseQueryHookResult = ReturnType<
  typeof useSourceProfilesListSuspenseQuery
>;
export type SourceProfilesListQueryResult = Apollo.QueryResult<
  SourceProfilesListQuery,
  SourceProfilesListQueryVariables
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
// @ts-ignore
export function useSourceProfilesForNewSourcePickerSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SourceProfilesForNewSourcePickerQuery,
    SourceProfilesForNewSourcePickerQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourceProfilesForNewSourcePickerQuery,
  SourceProfilesForNewSourcePickerQueryVariables
>;
export function useSourceProfilesForNewSourcePickerSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourceProfilesForNewSourcePickerQuery,
        SourceProfilesForNewSourcePickerQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourceProfilesForNewSourcePickerQuery | undefined,
  SourceProfilesForNewSourcePickerQueryVariables
>;
export function useSourceProfilesForNewSourcePickerSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourceProfilesForNewSourcePickerQuery,
        SourceProfilesForNewSourcePickerQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type SourceProfilesForNewSourcePickerSuspenseQueryHookResult =
  ReturnType<typeof useSourceProfilesForNewSourcePickerSuspenseQuery>;
export type SourceProfilesForNewSourcePickerQueryResult = Apollo.QueryResult<
  SourceProfilesForNewSourcePickerQuery,
  SourceProfilesForNewSourcePickerQueryVariables
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
// @ts-ignore
export function useSourcesForSourceProfileSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SourcesForSourceProfileQuery,
    SourcesForSourceProfileQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourcesForSourceProfileQuery,
  SourcesForSourceProfileQueryVariables
>;
export function useSourcesForSourceProfileSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourcesForSourceProfileQuery,
        SourcesForSourceProfileQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SourcesForSourceProfileQuery | undefined,
  SourcesForSourceProfileQueryVariables
>;
export function useSourcesForSourceProfileSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SourcesForSourceProfileQuery,
        SourcesForSourceProfileQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
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
export type SourcesForSourceProfileSuspenseQueryHookResult = ReturnType<
  typeof useSourcesForSourceProfileSuspenseQuery
>;
export type SourcesForSourceProfileQueryResult = Apollo.QueryResult<
  SourcesForSourceProfileQuery,
  SourcesForSourceProfileQueryVariables
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
export type UpdateSourceTemplateMutationFn = Apollo.MutationFunction<
  UpdateSourceTemplateMutation,
  UpdateSourceTemplateMutationVariables
>;

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
export type UpdateSourceTemplateMutationHookResult = ReturnType<
  typeof useUpdateSourceTemplateMutation
>;
export type UpdateSourceTemplateMutationResult =
  Apollo.MutationResult<UpdateSourceTemplateMutation>;
export type UpdateSourceTemplateMutationOptions = Apollo.BaseMutationOptions<
  UpdateSourceTemplateMutation,
  UpdateSourceTemplateMutationVariables
>;
export const DeleteSourceTemplateDocument = gql`
  mutation DeleteSourceTemplate($id: ID!) {
    deleteSourceTemplate(id: $id) {
      success
      deletedId
    }
  }
`;
export type DeleteSourceTemplateMutationFn = Apollo.MutationFunction<
  DeleteSourceTemplateMutation,
  DeleteSourceTemplateMutationVariables
>;

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
export type DeleteSourceTemplateMutationHookResult = ReturnType<
  typeof useDeleteSourceTemplateMutation
>;
export type DeleteSourceTemplateMutationResult =
  Apollo.MutationResult<DeleteSourceTemplateMutation>;
export type DeleteSourceTemplateMutationOptions = Apollo.BaseMutationOptions<
  DeleteSourceTemplateMutation,
  DeleteSourceTemplateMutationVariables
>;
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
export type CreateSourceTemplateMutationFn = Apollo.MutationFunction<
  CreateSourceTemplateMutation,
  CreateSourceTemplateMutationVariables
>;

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
export type CreateSourceTemplateMutationHookResult = ReturnType<
  typeof useCreateSourceTemplateMutation
>;
export type CreateSourceTemplateMutationResult =
  Apollo.MutationResult<CreateSourceTemplateMutation>;
export type CreateSourceTemplateMutationOptions = Apollo.BaseMutationOptions<
  CreateSourceTemplateMutation,
  CreateSourceTemplateMutationVariables
>;
export const UserPreferencesDocument = gql`
  query UserPreferences {
    userPreferences {
      text
      weight
    }
  }
`;

/**
 * __useUserPreferencesQuery__
 *
 * To run a query within a React component, call `useUserPreferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserPreferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserPreferencesQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserPreferencesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >(UserPreferencesDocument, options);
}
export function useUserPreferencesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >(UserPreferencesDocument, options);
}
// @ts-ignore
export function useUserPreferencesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  UserPreferencesQuery,
  UserPreferencesQueryVariables
>;
export function useUserPreferencesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        UserPreferencesQuery,
        UserPreferencesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  UserPreferencesQuery | undefined,
  UserPreferencesQueryVariables
>;
export function useUserPreferencesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        UserPreferencesQuery,
        UserPreferencesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    UserPreferencesQuery,
    UserPreferencesQueryVariables
  >(UserPreferencesDocument, options);
}
export type UserPreferencesQueryHookResult = ReturnType<
  typeof useUserPreferencesQuery
>;
export type UserPreferencesLazyQueryHookResult = ReturnType<
  typeof useUserPreferencesLazyQuery
>;
export type UserPreferencesSuspenseQueryHookResult = ReturnType<
  typeof useUserPreferencesSuspenseQuery
>;
export type UserPreferencesQueryResult = Apollo.QueryResult<
  UserPreferencesQuery,
  UserPreferencesQueryVariables
>;
export const UpdateUserPreferencesDocument = gql`
  mutation UpdateUserPreferences($items: [PreferenceInput!]!) {
    updateUserPreferences(items: $items) {
      text
      weight
    }
  }
`;
export type UpdateUserPreferencesMutationFn = Apollo.MutationFunction<
  UpdateUserPreferencesMutation,
  UpdateUserPreferencesMutationVariables
>;

/**
 * __useUpdateUserPreferencesMutation__
 *
 * To run a mutation, you first call `useUpdateUserPreferencesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserPreferencesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserPreferencesMutation, { data, loading, error }] = useUpdateUserPreferencesMutation({
 *   variables: {
 *      items: // value for 'items'
 *   },
 * });
 */
export function useUpdateUserPreferencesMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateUserPreferencesMutation,
    UpdateUserPreferencesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateUserPreferencesMutation,
    UpdateUserPreferencesMutationVariables
  >(UpdateUserPreferencesDocument, options);
}
export type UpdateUserPreferencesMutationHookResult = ReturnType<
  typeof useUpdateUserPreferencesMutation
>;
export type UpdateUserPreferencesMutationResult =
  Apollo.MutationResult<UpdateUserPreferencesMutation>;
export type UpdateUserPreferencesMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserPreferencesMutation,
  UpdateUserPreferencesMutationVariables
>;
