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
  Draft = "DRAFT",
  Duplicated = "DUPLICATED",
  Incoming = "INCOMING",
  New = "NEW",
}

export enum ApplicationStage {
  Applied = "APPLIED",
  CulturalFit = "CULTURAL_FIT",
  Draft = "DRAFT",
  Duplicated = "DUPLICATED",
  New = "NEW",
  Offer = "OFFER",
  RecruiterScreen = "RECRUITER_SCREEN",
  Rejected = "REJECTED",
  Technical = "TECHNICAL",
}

export enum AsyncMetadataStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Processing = "PROCESSING",
}

export type AsyncMetadataType = {
  __typename?: "AsyncMetadataType";
  error?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<AsyncMetadataStatus>;
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
};

export type AuthAccount = {
  __typename?: "AuthAccount";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  providerAccountId: Scalars["String"]["output"];
  providerName: AuthProvider;
};

export enum AuthProvider {
  Google = "GOOGLE",
}

export type CompanyType = {
  __typename?: "CompanyType";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type CreateJobInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  createAsDraftCapture?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  htmlContent?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salary?: InputMaybe<JobSalaryInput>;
  source?: InputMaybe<JobSource>;
  sourceRunId?: InputMaybe<Scalars["ID"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateJobStageEventInput = {
  jobId: Scalars["String"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<StageEventSource>;
  toStage: ApplicationStage;
};

export type CreateNoteInput = {
  content: Scalars["String"]["input"];
  jobId: Scalars["String"]["input"];
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

export type ExchangeRate = {
  __typename?: "ExchangeRate";
  currency: Scalars["String"]["output"];
  rate: Scalars["Float"]["output"];
};

export enum FitClassification {
  Negative = "Negative",
  Neutral = "Neutral",
  Positive = "Positive",
}

export type GenerateMatchInput = {
  jobId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export type JobSalary = {
  __typename?: "JobSalary";
  currency?: Maybe<Scalars["String"]["output"]>;
  maxCents?: Maybe<Scalars["Int"]["output"]>;
  minCents?: Maybe<Scalars["Int"]["output"]>;
  period?: Maybe<SalaryPeriod>;
};

export type JobSalaryInput = {
  currency?: InputMaybe<Scalars["String"]["input"]>;
  maxCents?: InputMaybe<Scalars["Int"]["input"]>;
  minCents?: InputMaybe<Scalars["Int"]["input"]>;
  period?: InputMaybe<SalaryPeriod>;
};

export enum JobSource {
  Jack = "JACK",
  Linkedin = "LINKEDIN",
  RemoteYeah = "REMOTE_YEAH",
  Wellfound = "WELLFOUND",
}

export type JobStageEventType = {
  __typename?: "JobStageEventType";
  createdAt: Scalars["DateTime"]["output"];
  fromStage?: Maybe<ApplicationStage>;
  id: Scalars["ID"]["output"];
  jobId: Scalars["String"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  scheduledAt?: Maybe<Scalars["DateTime"]["output"]>;
  source: StageEventSource;
  toStage: ApplicationStage;
  userId: Scalars["String"]["output"];
};

export type JobType = {
  __typename?: "JobType";
  company?: Maybe<CompanyType>;
  companyId?: Maybe<Scalars["ID"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  currentStage: ApplicationStage;
  currentStageAt: Scalars["DateTime"]["output"];
  currentStageReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  fillMetadata?: Maybe<AsyncMetadataType>;
  htmlContent?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  match?: Maybe<MatchAnalysisType>;
  salary?: Maybe<JobSalary>;
  source?: Maybe<JobSource>;
  sourceRunId?: Maybe<Scalars["ID"]["output"]>;
  summary?: Maybe<Scalars["String"]["output"]>;
  summaryMetadata?: Maybe<AsyncMetadataType>;
  tags: Array<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  urls: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
  workRegion?: Maybe<Scalars["String"]["output"]>;
};

export type MatchAnalysisType = {
  __typename?: "MatchAnalysisType";
  classification?: Maybe<FitClassification>;
  createdAt: Scalars["DateTime"]["output"];
  gapCount: Scalars["Int"]["output"];
  generationMetadata?: Maybe<AsyncMetadataType>;
  id: Scalars["ID"]["output"];
  items: Array<MatchItemType>;
  job?: Maybe<JobType>;
  jobId: Scalars["ID"]["output"];
  matchCount: Scalars["Int"]["output"];
  resumeId: Scalars["ID"]["output"];
  scoreRatio?: Maybe<Scalars["Float"]["output"]>;
  unclearCount: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type MatchItemType = {
  __typename?: "MatchItemType";
  jdQuote: Scalars["String"]["output"];
  requirement: Scalars["String"]["output"];
  source: MatchSource;
  sourceQuotes: Array<Scalars["String"]["output"]>;
  suggestion?: Maybe<Scalars["String"]["output"]>;
  type: RequirementType;
  verdict: MatchVerdict;
  weight?: Maybe<Scalars["String"]["output"]>;
};

export enum MatchSource {
  Preference = "Preference",
  Resume = "Resume",
}

export enum MatchVerdict {
  Fit = "Fit",
  Gap = "Gap",
  Unclear = "Unclear",
}

export type Mutation = {
  __typename?: "Mutation";
  claimSourceRun?: Maybe<SourceRunType>;
  clearSourceRuns: Scalars["Boolean"]["output"];
  createJob: JobType;
  createJobNote: NoteType;
  createJobStageEvent: JobStageEventType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deactivateAccount: Scalars["Boolean"]["output"];
  deleteCompany: DeleteMutationPayloadType;
  deleteJob: DeleteMutationPayloadType;
  deleteJobNote: DeleteMutationPayloadType;
  deleteJobStageEvent: DeleteMutationPayloadType;
  deleteMatchAnalysis: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachJobsFromSourceRun: Scalars["Int"]["output"];
  fillJobAutomatically: JobType;
  generateJobMatch: MatchAnalysisType;
  generateJobSummary: JobType;
  removeJobTag: JobType;
  rerunSourceTemplate: SourceRunType;
  updateCompany: CompanyType;
  updateJob: JobType;
  updateJobNote: NoteType;
  updateJobStageEvent: JobStageEventType;
  updateResume: ResumeType;
  updateSettings: UserSetting;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateSourceTemplate: SourceTemplateType;
  updateWorkPreferences: Array<PreferenceType>;
};

export type MutationClaimSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationCreateJobArgs = { input: CreateJobInput };

export type MutationCreateJobNoteArgs = { input: CreateNoteInput };

export type MutationCreateJobStageEventArgs = {
  input: CreateJobStageEventInput;
};

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationCreateSourceRunArgs = { input: CreateSourceRunInput };

export type MutationCreateSourceTemplateArgs = {
  input: CreateSourceTemplateInput;
};

export type MutationDeleteCompanyArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobNoteArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobStageEventArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteMatchAnalysisArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteResumeArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceTemplateArgs = { id: Scalars["ID"]["input"] };

export type MutationDetachJobsFromSourceRunArgs = {
  sourceRunId: Scalars["ID"]["input"];
};

export type MutationFillJobAutomaticallyArgs = {
  jobId: Scalars["ID"]["input"];
};

export type MutationGenerateJobMatchArgs = { input: GenerateMatchInput };

export type MutationGenerateJobSummaryArgs = { jobId: Scalars["ID"]["input"] };

export type MutationRemoveJobTagArgs = {
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
};

export type MutationRerunSourceTemplateArgs = {
  templateId: Scalars["ID"]["input"];
};

export type MutationUpdateCompanyArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateCompanyInput;
};

export type MutationUpdateJobArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateJobInput;
};

export type MutationUpdateJobNoteArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateNoteInput;
};

export type MutationUpdateJobStageEventArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateJobStageEventInput;
};

export type MutationUpdateResumeArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateResumeInput;
};

export type MutationUpdateSettingsArgs = { input: UpdateSettingsInput };

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
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  jobId?: Maybe<Scalars["String"]["output"]>;
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
  companies: Array<CompanyType>;
  company: CompanyType;
  companyJobsCount: Scalars["Int"]["output"];
  exchangeRates: CurrencyRates;
  generateCompanyDescription: Scalars["String"]["output"];
  generateJobLocationWithAI?: Maybe<Scalars["String"]["output"]>;
  generateJobNoteWithAI: Scalars["String"]["output"];
  generateJobWorkRegionWithAI?: Maybe<Scalars["String"]["output"]>;
  job: JobType;
  jobMatch?: Maybe<MatchAnalysisType>;
  jobNotes: Array<NoteType>;
  jobStageEvents: Array<JobStageEventType>;
  jobs: Array<JobType>;
  match: MatchAnalysisType;
  matchAnalyses: Array<MatchAnalysisType>;
  me: UserType;
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars["String"]["output"];
  settings: UserSetting;
  sourceProfiles: Array<SourceProfileType>;
  sourceRuns: Array<SourceRunType>;
  sourceTemplates: Array<SourceTemplateType>;
  sourceTemplatesForSourceProfile: Array<SourceTemplateType>;
  workPreferences: Array<PreferenceType>;
};

export type QueryCompanyArgs = { id: Scalars["ID"]["input"] };

export type QueryCompanyJobsCountArgs = { id: Scalars["ID"]["input"] };

export type QueryExchangeRatesArgs = {
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]>;
};

export type QueryGenerateCompanyDescriptionArgs = {
  companyName: Scalars["String"]["input"];
};

export type QueryGenerateJobLocationWithAiArgs = {
  jobId: Scalars["ID"]["input"];
};

export type QueryGenerateJobNoteWithAiArgs = {
  jobId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
};

export type QueryGenerateJobWorkRegionWithAiArgs = {
  jobId: Scalars["ID"]["input"];
};

export type QueryJobArgs = { id: Scalars["ID"]["input"] };

export type QueryJobMatchArgs = { jobId: Scalars["ID"]["input"] };

export type QueryJobNotesArgs = { jobId: Scalars["ID"]["input"] };

export type QueryJobStageEventsArgs = { jobId: Scalars["ID"]["input"] };

export type QueryJobsArgs = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<ApplicationQuickFilter>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryMatchArgs = { id: Scalars["ID"]["input"] };

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

export enum RequirementType {
  MustHave = "MustHave",
  NiceToHave = "NiceToHave",
  SoftSkill = "SoftSkill",
}

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

export enum StageEventSource {
  Manual = "Manual",
  System = "System",
}

export type Subscription = {
  __typename?: "Subscription";
  sourceRunEvents: SourceRunEvent;
};

export type UpdateCompanyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateJobInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  htmlContent?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salary?: InputMaybe<JobSalaryInput>;
  source?: InputMaybe<JobSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateJobStageEventInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  toStage?: InputMaybe<ApplicationStage>;
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

export type UpdateSettingsInput = {
  autoFillEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoSummaryEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  duplicateWindowDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateSourceRunInput = { surfaceUrl: Scalars["String"]["input"] };

export type UpdateSourceTemplateInput = {
  scheduleCron?: InputMaybe<Scalars["String"]["input"]>;
  scheduleEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  surfaceUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserSetting = {
  __typename?: "UserSetting";
  autoFillEnabled: Scalars["Boolean"]["output"];
  autoSummaryEnabled: Scalars["Boolean"]["output"];
  duplicateWindowDays: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  userId: Scalars["String"]["output"];
};

export type UserType = {
  __typename?: "UserType";
  accounts: Array<AuthAccount>;
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

export type CompanyJobsCountQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type CompanyJobsCountQuery = {
  __typename?: "Query";
  companyJobsCount: number;
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

export type CompanyQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type CompanyQuery = {
  __typename?: "Query";
  company: {
    __typename?: "CompanyType";
    id: string;
    name: string;
    description?: string | null;
  };
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

export type JobSalarySelectionFragment = {
  __typename?: "JobType";
  salary?: {
    __typename?: "JobSalary";
    minCents?: number | null;
    maxCents?: number | null;
    currency?: string | null;
    period?: SalaryPeriod | null;
  } | null;
};

export type JobsQueryVariables = Exact<{
  filter?: InputMaybe<ApplicationQuickFilter>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type JobsQuery = {
  __typename?: "Query";
  jobs: Array<{
    __typename?: "JobType";
    id: string;
    title?: string | null;
    companyId?: string | null;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
    tags: Array<string>;
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
    summary?: string | null;
    currentStage: ApplicationStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    company?: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    } | null;
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    fillMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    match?: {
      __typename?: "MatchAnalysisType";
      id: string;
      resumeId: string;
      scoreRatio?: number | null;
      classification?: FitClassification | null;
      matchCount: number;
      gapCount: number;
      unclearCount: number;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status?: AsyncMetadataStatus | null;
        error?: string | null;
        timestamp?: any | null;
      } | null;
    } | null;
    salary?: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    } | null;
  }>;
};

export type JobQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type JobQuery = {
  __typename?: "Query";
  job: {
    __typename?: "JobType";
    id: string;
    title?: string | null;
    companyId?: string | null;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
    tags: Array<string>;
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
    summary?: string | null;
    htmlContent?: string | null;
    currentStage: ApplicationStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    company?: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    } | null;
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    fillMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    match?: {
      __typename?: "MatchAnalysisType";
      id: string;
      resumeId: string;
      scoreRatio?: number | null;
      classification?: FitClassification | null;
      matchCount: number;
      gapCount: number;
      unclearCount: number;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status?: AsyncMetadataStatus | null;
        error?: string | null;
        timestamp?: any | null;
      } | null;
    } | null;
    salary?: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    } | null;
  };
};

export type CreateJobMutationVariables = Exact<{ input: CreateJobInput }>;

export type CreateJobMutation = {
  __typename?: "Mutation";
  createJob: {
    __typename?: "JobType";
    id: string;
    title?: string | null;
    companyId?: string | null;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
    tags: Array<string>;
    location?: string | null;
    workRegion?: string | null;
    createdAt: any;
    company?: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    } | null;
    salary?: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    } | null;
  };
};

export type GenerateCompanyDescriptionQueryVariables = Exact<{
  companyName: Scalars["String"]["input"];
}>;

export type GenerateCompanyDescriptionQuery = {
  __typename?: "Query";
  generateCompanyDescription: string;
};

export type UpdateJobMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateJobInput;
}>;

export type UpdateJobMutation = {
  __typename?: "Mutation";
  updateJob: {
    __typename?: "JobType";
    id: string;
    title?: string | null;
    companyId?: string | null;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
    tags: Array<string>;
    location?: string | null;
    workRegion?: string | null;
    summary?: string | null;
    createdAt: any;
    company?: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    } | null;
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    salary?: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    } | null;
  };
};

export type RemoveJobTagMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
}>;

export type RemoveJobTagMutation = {
  __typename?: "Mutation";
  removeJobTag: { __typename?: "JobType"; id: string; tags: Array<string> };
};

export type DeleteJobMutationVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type DeleteJobMutation = {
  __typename?: "Mutation";
  deleteJob: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type JobStageEventsQueryVariables = Exact<{
  jobId: Scalars["ID"]["input"];
}>;

export type JobStageEventsQuery = {
  __typename?: "Query";
  jobStageEvents: Array<{
    __typename?: "JobStageEventType";
    id: string;
    jobId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: StageEventSource;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  }>;
};

export type CreateJobStageEventMutationVariables = Exact<{
  input: CreateJobStageEventInput;
}>;

export type CreateJobStageEventMutation = {
  __typename?: "Mutation";
  createJobStageEvent: {
    __typename?: "JobStageEventType";
    id: string;
    jobId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: StageEventSource;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  };
};

export type UpdateJobStageEventMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateJobStageEventInput;
}>;

export type UpdateJobStageEventMutation = {
  __typename?: "Mutation";
  updateJobStageEvent: {
    __typename?: "JobStageEventType";
    id: string;
    jobId: string;
    fromStage?: ApplicationStage | null;
    toStage: ApplicationStage;
    source: StageEventSource;
    reason?: string | null;
    scheduledAt?: any | null;
    createdAt: any;
  };
};

export type DeleteJobStageEventMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteJobStageEventMutation = {
  __typename?: "Mutation";
  deleteJobStageEvent: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type JobNotesQueryVariables = Exact<{ jobId: Scalars["ID"]["input"] }>;

export type JobNotesQuery = {
  __typename?: "Query";
  jobNotes: Array<{
    __typename?: "NoteType";
    id: string;
    jobId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type CreateJobNoteMutationVariables = Exact<{ input: CreateNoteInput }>;

export type CreateJobNoteMutation = {
  __typename?: "Mutation";
  createJobNote: {
    __typename?: "NoteType";
    id: string;
    jobId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  };
};

export type UpdateJobNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateNoteInput;
}>;

export type UpdateJobNoteMutation = {
  __typename?: "Mutation";
  updateJobNote: {
    __typename?: "NoteType";
    id: string;
    jobId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  };
};

export type DeleteJobNoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteJobNoteMutation = {
  __typename?: "Mutation";
  deleteJobNote: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type GenerateJobNoteWithAiQueryVariables = Exact<{
  jobId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
}>;

export type GenerateJobNoteWithAiQuery = {
  __typename?: "Query";
  generateJobNoteWithAI: string;
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

export type GenerateJobLocationWithAiQueryVariables = Exact<{
  jobId: Scalars["ID"]["input"];
}>;

export type GenerateJobLocationWithAiQuery = {
  __typename?: "Query";
  generateJobLocationWithAI?: string | null;
};

export type GenerateJobWorkRegionWithAiQueryVariables = Exact<{
  jobId: Scalars["ID"]["input"];
}>;

export type GenerateJobWorkRegionWithAiQuery = {
  __typename?: "Query";
  generateJobWorkRegionWithAI?: string | null;
};

export type GenerateJobSummaryMutationVariables = Exact<{
  jobId: Scalars["ID"]["input"];
}>;

export type GenerateJobSummaryMutation = {
  __typename?: "Mutation";
  generateJobSummary: {
    __typename?: "JobType";
    id: string;
    summary?: string | null;
    summaryMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
  };
};

export type FillJobAutomaticallyMutationVariables = Exact<{
  jobId: Scalars["ID"]["input"];
}>;

export type FillJobAutomaticallyMutation = {
  __typename?: "Mutation";
  fillJobAutomatically: {
    __typename?: "JobType";
    id: string;
    currentStage: ApplicationStage;
    fillMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
  };
};

export type CreateDraftCaptureJobMutationVariables = Exact<{
  input: CreateJobInput;
}>;

export type CreateDraftCaptureJobMutation = {
  __typename?: "Mutation";
  createJob: {
    __typename?: "JobType";
    id: string;
    title?: string | null;
    urls: Array<string>;
    htmlContent?: string | null;
    currentStage: ApplicationStage;
    createdAt: any;
    fillMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
  };
};

export type MatchAnalysesListQueryVariables = Exact<{ [key: string]: never }>;

export type MatchAnalysesListQuery = {
  __typename?: "Query";
  matchAnalyses: Array<{
    __typename?: "MatchAnalysisType";
    id: string;
    jobId: string;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: FitClassification | null;
    matchCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    updatedAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    job?: {
      __typename?: "JobType";
      id: string;
      title?: string | null;
      company?: { __typename?: "CompanyType"; id: string; name: string } | null;
    } | null;
  }>;
};

export type MatchQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type MatchQuery = {
  __typename?: "Query";
  match: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId: string;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: FitClassification | null;
    matchCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    items: Array<{
      __typename?: "MatchItemType";
      requirement: string;
      source: MatchSource;
      weight?: string | null;
      type: RequirementType;
      verdict: MatchVerdict;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
    job?: {
      __typename?: "JobType";
      id: string;
      title?: string | null;
      company?: { __typename?: "CompanyType"; id: string; name: string } | null;
    } | null;
  };
};

export type JobMatchQueryVariables = Exact<{ jobId: Scalars["ID"]["input"] }>;

export type JobMatchQuery = {
  __typename?: "Query";
  jobMatch?: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId: string;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: FitClassification | null;
    matchCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    items: Array<{
      __typename?: "MatchItemType";
      requirement: string;
      source: MatchSource;
      weight?: string | null;
      type: RequirementType;
      verdict: MatchVerdict;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
  } | null;
};

export type GenerateJobMatchMutationVariables = Exact<{
  input: GenerateMatchInput;
}>;

export type GenerateJobMatchMutation = {
  __typename?: "Mutation";
  generateJobMatch: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId: string;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: FitClassification | null;
    matchCount: number;
    gapCount: number;
    unclearCount: number;
    createdAt: any;
    generationMetadata?: {
      __typename?: "AsyncMetadataType";
      status?: AsyncMetadataStatus | null;
      error?: string | null;
      timestamp?: any | null;
    } | null;
    items: Array<{
      __typename?: "MatchItemType";
      requirement: string;
      source: MatchSource;
      weight?: string | null;
      type: RequirementType;
      verdict: MatchVerdict;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
  };
};

export type DeleteMatchAnalysisMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteMatchAnalysisMutation = {
  __typename?: "Mutation";
  deleteMatchAnalysis: {
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
    accounts: Array<{
      __typename?: "AuthAccount";
      id: string;
      providerName: AuthProvider;
      providerAccountId: string;
      createdAt: any;
    }>;
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

export type ResumesForPickerQueryVariables = Exact<{ [key: string]: never }>;

export type ResumesForPickerQuery = {
  __typename?: "Query";
  resumes: Array<{
    __typename?: "ResumeType";
    id: string;
    title: string;
    isDefault: boolean;
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

export type SettingsQueryVariables = Exact<{ [key: string]: never }>;

export type SettingsQuery = {
  __typename?: "Query";
  settings: {
    __typename?: "UserSetting";
    id: string;
    autoFillEnabled: boolean;
    autoSummaryEnabled: boolean;
    duplicateWindowDays: number;
  };
};

export type UpdateSettingsMutationVariables = Exact<{
  input: UpdateSettingsInput;
}>;

export type UpdateSettingsMutation = {
  __typename?: "Mutation";
  updateSettings: {
    __typename?: "UserSetting";
    id: string;
    autoFillEnabled: boolean;
    autoSummaryEnabled: boolean;
    duplicateWindowDays: number;
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

export const JobSalarySelectionFragmentDoc = gql`
  fragment JobSalarySelection on JobType {
    salary {
      minCents
      maxCents
      currency
      period
    }
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

export const CompanyJobsCountDocument = gql`
  query CompanyJobsCount($id: ID!) {
    companyJobsCount(id: $id)
  }
`;

/**
 * __useCompanyJobsCountQuery__
 *
 * To run a query within a React component, call `useCompanyJobsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyJobsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyJobsCountQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCompanyJobsCountQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    CompanyJobsCountQuery,
    CompanyJobsCountQueryVariables
  > &
    (
      | { variables: CompanyJobsCountQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    CompanyJobsCountQuery,
    CompanyJobsCountQueryVariables
  >(CompanyJobsCountDocument, options);
}
export function useCompanyJobsCountLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CompanyJobsCountQuery,
    CompanyJobsCountQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    CompanyJobsCountQuery,
    CompanyJobsCountQueryVariables
  >(CompanyJobsCountDocument, options);
}

export type CompanyJobsCountQueryHookResult = ReturnType<
  typeof useCompanyJobsCountQuery
>;
export type CompanyJobsCountLazyQueryHookResult = ReturnType<
  typeof useCompanyJobsCountLazyQuery
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

export const CompanyDocument = gql`
  query Company($id: ID!) {
    company(id: $id) {
      id
      name
      description
    }
  }
`;

/**
 * __useCompanyQuery__
 *
 * To run a query within a React component, call `useCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCompanyQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    CompanyQuery,
    CompanyQueryVariables
  > &
    ({ variables: CompanyQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<CompanyQuery, CompanyQueryVariables>(
    CompanyDocument,
    options,
  );
}
export function useCompanyLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CompanyQuery,
    CompanyQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<CompanyQuery, CompanyQueryVariables>(
    CompanyDocument,
    options,
  );
}

export type CompanyQueryHookResult = ReturnType<typeof useCompanyQuery>;
export type CompanyLazyQueryHookResult = ReturnType<typeof useCompanyLazyQuery>;

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

export const JobsDocument = gql`
  query Jobs($filter: ApplicationQuickFilter, $company: String, $runId: ID) {
    jobs(filter: $filter, company: $company, runId: $runId) {
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
      ...JobSalarySelection
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
      fillMetadata {
        status
        error
        timestamp
      }
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      match {
        id
        resumeId
        scoreRatio
        classification
        matchCount
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
  ${JobSalarySelectionFragmentDoc}
`;

/**
 * __useJobsQuery__
 *
 * To run a query within a React component, call `useJobsQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      company: // value for 'company'
 *      runId: // value for 'runId'
 *   },
 * });
 */
export function useJobsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    JobsQuery,
    JobsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<JobsQuery, JobsQueryVariables>(
    JobsDocument,
    options,
  );
}
export function useJobsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    JobsQuery,
    JobsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<JobsQuery, JobsQueryVariables>(
    JobsDocument,
    options,
  );
}

export type JobsQueryHookResult = ReturnType<typeof useJobsQuery>;
export type JobsLazyQueryHookResult = ReturnType<typeof useJobsLazyQuery>;

export const JobDocument = gql`
  query Job($id: ID!) {
    job(id: $id) {
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
      ...JobSalarySelection
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
      fillMetadata {
        status
        error
        timestamp
      }
      htmlContent
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      match {
        id
        resumeId
        scoreRatio
        classification
        matchCount
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
  ${JobSalarySelectionFragmentDoc}
`;

/**
 * __useJobQuery__
 *
 * To run a query within a React component, call `useJobQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useJobQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<JobQuery, JobQueryVariables> &
    ({ variables: JobQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<JobQuery, JobQueryVariables>(
    JobDocument,
    options,
  );
}
export function useJobLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    JobQuery,
    JobQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<JobQuery, JobQueryVariables>(
    JobDocument,
    options,
  );
}

export type JobQueryHookResult = ReturnType<typeof useJobQuery>;
export type JobLazyQueryHookResult = ReturnType<typeof useJobLazyQuery>;

export const CreateJobDocument = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
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
      ...JobSalarySelection
      tags
      location
      workRegion
      createdAt
    }
  }
  ${JobSalarySelectionFragmentDoc}
`;

/**
 * __useCreateJobMutation__
 *
 * To run a mutation, you first call `useCreateJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJobMutation, { data, loading, error }] = useCreateJobMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateJobMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateJobMutation,
    CreateJobMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateJobMutation,
    CreateJobMutationVariables
  >(CreateJobDocument, options);
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

export const UpdateJobDocument = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
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
      ...JobSalarySelection
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
  ${JobSalarySelectionFragmentDoc}
`;

/**
 * __useUpdateJobMutation__
 *
 * To run a mutation, you first call `useUpdateJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateJobMutation, { data, loading, error }] = useUpdateJobMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateJobMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateJobMutation,
    UpdateJobMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateJobMutation,
    UpdateJobMutationVariables
  >(UpdateJobDocument, options);
}

export const RemoveJobTagDocument = gql`
  mutation RemoveJobTag($id: ID!, $tag: String!) {
    removeJobTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;

/**
 * __useRemoveJobTagMutation__
 *
 * To run a mutation, you first call `useRemoveJobTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveJobTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeJobTagMutation, { data, loading, error }] = useRemoveJobTagMutation({
 *   variables: {
 *      id: // value for 'id'
 *      tag: // value for 'tag'
 *   },
 * });
 */
export function useRemoveJobTagMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    RemoveJobTagMutation,
    RemoveJobTagMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    RemoveJobTagMutation,
    RemoveJobTagMutationVariables
  >(RemoveJobTagDocument, options);
}

export const DeleteJobDocument = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteJobMutation__
 *
 * To run a mutation, you first call `useDeleteJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobMutation, { data, loading, error }] = useDeleteJobMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJobMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteJobMutation,
    DeleteJobMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteJobMutation,
    DeleteJobMutationVariables
  >(DeleteJobDocument, options);
}

export const JobStageEventsDocument = gql`
  query JobStageEvents($jobId: ID!) {
    jobStageEvents(jobId: $jobId) {
      id
      jobId
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
 * __useJobStageEventsQuery__
 *
 * To run a query within a React component, call `useJobStageEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobStageEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobStageEventsQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobStageEventsQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    JobStageEventsQuery,
    JobStageEventsQueryVariables
  > &
    (
      | { variables: JobStageEventsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    JobStageEventsQuery,
    JobStageEventsQueryVariables
  >(JobStageEventsDocument, options);
}
export function useJobStageEventsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    JobStageEventsQuery,
    JobStageEventsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    JobStageEventsQuery,
    JobStageEventsQueryVariables
  >(JobStageEventsDocument, options);
}

export type JobStageEventsQueryHookResult = ReturnType<
  typeof useJobStageEventsQuery
>;
export type JobStageEventsLazyQueryHookResult = ReturnType<
  typeof useJobStageEventsLazyQuery
>;

export const CreateJobStageEventDocument = gql`
  mutation CreateJobStageEvent($input: CreateJobStageEventInput!) {
    createJobStageEvent(input: $input) {
      id
      jobId
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
 * __useCreateJobStageEventMutation__
 *
 * To run a mutation, you first call `useCreateJobStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJobStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJobStageEventMutation, { data, loading, error }] = useCreateJobStageEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateJobStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateJobStageEventMutation,
    CreateJobStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateJobStageEventMutation,
    CreateJobStageEventMutationVariables
  >(CreateJobStageEventDocument, options);
}

export const UpdateJobStageEventDocument = gql`
  mutation UpdateJobStageEvent($id: ID!, $input: UpdateJobStageEventInput!) {
    updateJobStageEvent(id: $id, input: $input) {
      id
      jobId
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
 * __useUpdateJobStageEventMutation__
 *
 * To run a mutation, you first call `useUpdateJobStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateJobStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateJobStageEventMutation, { data, loading, error }] = useUpdateJobStageEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateJobStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateJobStageEventMutation,
    UpdateJobStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateJobStageEventMutation,
    UpdateJobStageEventMutationVariables
  >(UpdateJobStageEventDocument, options);
}

export const DeleteJobStageEventDocument = gql`
  mutation DeleteJobStageEvent($id: ID!) {
    deleteJobStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteJobStageEventMutation__
 *
 * To run a mutation, you first call `useDeleteJobStageEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobStageEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobStageEventMutation, { data, loading, error }] = useDeleteJobStageEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJobStageEventMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteJobStageEventMutation,
    DeleteJobStageEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteJobStageEventMutation,
    DeleteJobStageEventMutationVariables
  >(DeleteJobStageEventDocument, options);
}

export const JobNotesDocument = gql`
  query JobNotes($jobId: ID!) {
    jobNotes(jobId: $jobId) {
      id
      jobId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useJobNotesQuery__
 *
 * To run a query within a React component, call `useJobNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobNotesQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobNotesQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    JobNotesQuery,
    JobNotesQueryVariables
  > &
    ({ variables: JobNotesQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<JobNotesQuery, JobNotesQueryVariables>(
    JobNotesDocument,
    options,
  );
}
export function useJobNotesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    JobNotesQuery,
    JobNotesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<JobNotesQuery, JobNotesQueryVariables>(
    JobNotesDocument,
    options,
  );
}

export type JobNotesQueryHookResult = ReturnType<typeof useJobNotesQuery>;
export type JobNotesLazyQueryHookResult = ReturnType<
  typeof useJobNotesLazyQuery
>;

export const CreateJobNoteDocument = gql`
  mutation CreateJobNote($input: CreateNoteInput!) {
    createJobNote(input: $input) {
      id
      jobId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useCreateJobNoteMutation__
 *
 * To run a mutation, you first call `useCreateJobNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJobNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJobNoteMutation, { data, loading, error }] = useCreateJobNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateJobNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateJobNoteMutation,
    CreateJobNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateJobNoteMutation,
    CreateJobNoteMutationVariables
  >(CreateJobNoteDocument, options);
}

export const UpdateJobNoteDocument = gql`
  mutation UpdateJobNote($id: ID!, $input: UpdateNoteInput!) {
    updateJobNote(id: $id, input: $input) {
      id
      jobId
      content
      revision
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useUpdateJobNoteMutation__
 *
 * To run a mutation, you first call `useUpdateJobNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateJobNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateJobNoteMutation, { data, loading, error }] = useUpdateJobNoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateJobNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateJobNoteMutation,
    UpdateJobNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateJobNoteMutation,
    UpdateJobNoteMutationVariables
  >(UpdateJobNoteDocument, options);
}

export const DeleteJobNoteDocument = gql`
  mutation DeleteJobNote($id: ID!) {
    deleteJobNote(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteJobNoteMutation__
 *
 * To run a mutation, you first call `useDeleteJobNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobNoteMutation, { data, loading, error }] = useDeleteJobNoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJobNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteJobNoteMutation,
    DeleteJobNoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteJobNoteMutation,
    DeleteJobNoteMutationVariables
  >(DeleteJobNoteDocument, options);
}

export const GenerateJobNoteWithAiDocument = gql`
  query GenerateJobNoteWithAi($jobId: ID!, $note: String!) {
    generateJobNoteWithAI(jobId: $jobId, note: $note)
  }
`;

/**
 * __useGenerateJobNoteWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateJobNoteWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateJobNoteWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateJobNoteWithAiQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useGenerateJobNoteWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateJobNoteWithAiQuery,
    GenerateJobNoteWithAiQueryVariables
  > &
    (
      | { variables: GenerateJobNoteWithAiQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateJobNoteWithAiQuery,
    GenerateJobNoteWithAiQueryVariables
  >(GenerateJobNoteWithAiDocument, options);
}
export function useGenerateJobNoteWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateJobNoteWithAiQuery,
    GenerateJobNoteWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateJobNoteWithAiQuery,
    GenerateJobNoteWithAiQueryVariables
  >(GenerateJobNoteWithAiDocument, options);
}

export type GenerateJobNoteWithAiQueryHookResult = ReturnType<
  typeof useGenerateJobNoteWithAiQuery
>;
export type GenerateJobNoteWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateJobNoteWithAiLazyQuery
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

export const GenerateJobLocationWithAiDocument = gql`
  query GenerateJobLocationWithAi($jobId: ID!) {
    generateJobLocationWithAI(jobId: $jobId)
  }
`;

/**
 * __useGenerateJobLocationWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateJobLocationWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateJobLocationWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateJobLocationWithAiQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useGenerateJobLocationWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateJobLocationWithAiQuery,
    GenerateJobLocationWithAiQueryVariables
  > &
    (
      | { variables: GenerateJobLocationWithAiQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateJobLocationWithAiQuery,
    GenerateJobLocationWithAiQueryVariables
  >(GenerateJobLocationWithAiDocument, options);
}
export function useGenerateJobLocationWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateJobLocationWithAiQuery,
    GenerateJobLocationWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateJobLocationWithAiQuery,
    GenerateJobLocationWithAiQueryVariables
  >(GenerateJobLocationWithAiDocument, options);
}

export type GenerateJobLocationWithAiQueryHookResult = ReturnType<
  typeof useGenerateJobLocationWithAiQuery
>;
export type GenerateJobLocationWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateJobLocationWithAiLazyQuery
>;

export const GenerateJobWorkRegionWithAiDocument = gql`
  query GenerateJobWorkRegionWithAi($jobId: ID!) {
    generateJobWorkRegionWithAI(jobId: $jobId)
  }
`;

/**
 * __useGenerateJobWorkRegionWithAiQuery__
 *
 * To run a query within a React component, call `useGenerateJobWorkRegionWithAiQuery` and pass it any options that fit your needs.
 * When your component renders, `useGenerateJobWorkRegionWithAiQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGenerateJobWorkRegionWithAiQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useGenerateJobWorkRegionWithAiQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GenerateJobWorkRegionWithAiQuery,
    GenerateJobWorkRegionWithAiQueryVariables
  > &
    (
      | { variables: GenerateJobWorkRegionWithAiQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GenerateJobWorkRegionWithAiQuery,
    GenerateJobWorkRegionWithAiQueryVariables
  >(GenerateJobWorkRegionWithAiDocument, options);
}
export function useGenerateJobWorkRegionWithAiLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GenerateJobWorkRegionWithAiQuery,
    GenerateJobWorkRegionWithAiQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GenerateJobWorkRegionWithAiQuery,
    GenerateJobWorkRegionWithAiQueryVariables
  >(GenerateJobWorkRegionWithAiDocument, options);
}

export type GenerateJobWorkRegionWithAiQueryHookResult = ReturnType<
  typeof useGenerateJobWorkRegionWithAiQuery
>;
export type GenerateJobWorkRegionWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateJobWorkRegionWithAiLazyQuery
>;

export const GenerateJobSummaryDocument = gql`
  mutation GenerateJobSummary($jobId: ID!) {
    generateJobSummary(jobId: $jobId) {
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
 * __useGenerateJobSummaryMutation__
 *
 * To run a mutation, you first call `useGenerateJobSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateJobSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateJobSummaryMutation, { data, loading, error }] = useGenerateJobSummaryMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useGenerateJobSummaryMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    GenerateJobSummaryMutation,
    GenerateJobSummaryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    GenerateJobSummaryMutation,
    GenerateJobSummaryMutationVariables
  >(GenerateJobSummaryDocument, options);
}

export const FillJobAutomaticallyDocument = gql`
  mutation FillJobAutomatically($jobId: ID!) {
    fillJobAutomatically(jobId: $jobId) {
      id
      fillMetadata {
        status
        error
        timestamp
      }
      currentStage
    }
  }
`;

/**
 * __useFillJobAutomaticallyMutation__
 *
 * To run a mutation, you first call `useFillJobAutomaticallyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFillJobAutomaticallyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [fillJobAutomaticallyMutation, { data, loading, error }] = useFillJobAutomaticallyMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useFillJobAutomaticallyMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    FillJobAutomaticallyMutation,
    FillJobAutomaticallyMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    FillJobAutomaticallyMutation,
    FillJobAutomaticallyMutationVariables
  >(FillJobAutomaticallyDocument, options);
}

export const CreateDraftCaptureJobDocument = gql`
  mutation CreateDraftCaptureJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      urls
      htmlContent
      currentStage
      fillMetadata {
        status
        error
        timestamp
      }
      createdAt
    }
  }
`;

/**
 * __useCreateDraftCaptureJobMutation__
 *
 * To run a mutation, you first call `useCreateDraftCaptureJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDraftCaptureJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDraftCaptureJobMutation, { data, loading, error }] = useCreateDraftCaptureJobMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDraftCaptureJobMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateDraftCaptureJobMutation,
    CreateDraftCaptureJobMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateDraftCaptureJobMutation,
    CreateDraftCaptureJobMutationVariables
  >(CreateDraftCaptureJobDocument, options);
}

export const MatchAnalysesListDocument = gql`
  query MatchAnalysesList {
    matchAnalyses {
      id
      jobId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
      scoreRatio
      classification
      matchCount
      gapCount
      unclearCount
      createdAt
      updatedAt
      job {
        id
        title
        company {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useMatchAnalysesListQuery__
 *
 * To run a query within a React component, call `useMatchAnalysesListQuery` and pass it any options that fit your needs.
 * When your component renders, `useMatchAnalysesListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMatchAnalysesListQuery({
 *   variables: {
 *   },
 * });
 */
export function useMatchAnalysesListQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    MatchAnalysesListQuery,
    MatchAnalysesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    MatchAnalysesListQuery,
    MatchAnalysesListQueryVariables
  >(MatchAnalysesListDocument, options);
}
export function useMatchAnalysesListLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    MatchAnalysesListQuery,
    MatchAnalysesListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    MatchAnalysesListQuery,
    MatchAnalysesListQueryVariables
  >(MatchAnalysesListDocument, options);
}

export type MatchAnalysesListQueryHookResult = ReturnType<
  typeof useMatchAnalysesListQuery
>;
export type MatchAnalysesListLazyQueryHookResult = ReturnType<
  typeof useMatchAnalysesListLazyQuery
>;

export const MatchDocument = gql`
  query Match($id: ID!) {
    match(id: $id) {
      id
      jobId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
      scoreRatio
      classification
      matchCount
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
      job {
        id
        title
        company {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useMatchQuery__
 *
 * To run a query within a React component, call `useMatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useMatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMatchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useMatchQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    MatchQuery,
    MatchQueryVariables
  > &
    ({ variables: MatchQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<MatchQuery, MatchQueryVariables>(
    MatchDocument,
    options,
  );
}
export function useMatchLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    MatchQuery,
    MatchQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<MatchQuery, MatchQueryVariables>(
    MatchDocument,
    options,
  );
}

export type MatchQueryHookResult = ReturnType<typeof useMatchQuery>;
export type MatchLazyQueryHookResult = ReturnType<typeof useMatchLazyQuery>;

export const JobMatchDocument = gql`
  query JobMatch($jobId: ID!) {
    jobMatch(jobId: $jobId) {
      id
      jobId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
      scoreRatio
      classification
      matchCount
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
 * __useJobMatchQuery__
 *
 * To run a query within a React component, call `useJobMatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobMatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobMatchQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobMatchQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    JobMatchQuery,
    JobMatchQueryVariables
  > &
    ({ variables: JobMatchQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<JobMatchQuery, JobMatchQueryVariables>(
    JobMatchDocument,
    options,
  );
}
export function useJobMatchLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    JobMatchQuery,
    JobMatchQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<JobMatchQuery, JobMatchQueryVariables>(
    JobMatchDocument,
    options,
  );
}

export type JobMatchQueryHookResult = ReturnType<typeof useJobMatchQuery>;
export type JobMatchLazyQueryHookResult = ReturnType<
  typeof useJobMatchLazyQuery
>;

export const GenerateJobMatchDocument = gql`
  mutation GenerateJobMatch($input: GenerateMatchInput!) {
    generateJobMatch(input: $input) {
      id
      jobId
      resumeId
      generationMetadata {
        status
        error
        timestamp
      }
      scoreRatio
      classification
      matchCount
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
 * __useGenerateJobMatchMutation__
 *
 * To run a mutation, you first call `useGenerateJobMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateJobMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateJobMatchMutation, { data, loading, error }] = useGenerateJobMatchMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateJobMatchMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    GenerateJobMatchMutation,
    GenerateJobMatchMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    GenerateJobMatchMutation,
    GenerateJobMatchMutationVariables
  >(GenerateJobMatchDocument, options);
}

export const DeleteMatchAnalysisDocument = gql`
  mutation DeleteMatchAnalysis($id: ID!) {
    deleteMatchAnalysis(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteMatchAnalysisMutation__
 *
 * To run a mutation, you first call `useDeleteMatchAnalysisMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMatchAnalysisMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMatchAnalysisMutation, { data, loading, error }] = useDeleteMatchAnalysisMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteMatchAnalysisMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteMatchAnalysisMutation,
    DeleteMatchAnalysisMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteMatchAnalysisMutation,
    DeleteMatchAnalysisMutationVariables
  >(DeleteMatchAnalysisDocument, options);
}

export const MeDocument = gql`
  query Me {
    me {
      id
      email
      name
      role
      avatarUrl
      accounts {
        id
        providerName
        providerAccountId
        createdAt
      }
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

export const ResumesForPickerDocument = gql`
  query ResumesForPicker {
    resumes {
      id
      title
      isDefault
    }
  }
`;

/**
 * __useResumesForPickerQuery__
 *
 * To run a query within a React component, call `useResumesForPickerQuery` and pass it any options that fit your needs.
 * When your component renders, `useResumesForPickerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useResumesForPickerQuery({
 *   variables: {
 *   },
 * });
 */
export function useResumesForPickerQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ResumesForPickerQuery,
    ResumesForPickerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ResumesForPickerQuery,
    ResumesForPickerQueryVariables
  >(ResumesForPickerDocument, options);
}
export function useResumesForPickerLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ResumesForPickerQuery,
    ResumesForPickerQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ResumesForPickerQuery,
    ResumesForPickerQueryVariables
  >(ResumesForPickerDocument, options);
}

export type ResumesForPickerQueryHookResult = ReturnType<
  typeof useResumesForPickerQuery
>;
export type ResumesForPickerLazyQueryHookResult = ReturnType<
  typeof useResumesForPickerLazyQuery
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

export const SettingsDocument = gql`
  query Settings {
    settings {
      id
      autoFillEnabled
      autoSummaryEnabled
      duplicateWindowDays
    }
  }
`;

/**
 * __useSettingsQuery__
 *
 * To run a query within a React component, call `useSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSettingsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    SettingsQuery,
    SettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<SettingsQuery, SettingsQueryVariables>(
    SettingsDocument,
    options,
  );
}
export function useSettingsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SettingsQuery,
    SettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<SettingsQuery, SettingsQueryVariables>(
    SettingsDocument,
    options,
  );
}

export type SettingsQueryHookResult = ReturnType<typeof useSettingsQuery>;
export type SettingsLazyQueryHookResult = ReturnType<
  typeof useSettingsLazyQuery
>;

export const UpdateSettingsDocument = gql`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      id
      autoFillEnabled
      autoSummaryEnabled
      duplicateWindowDays
    }
  }
`;

/**
 * __useUpdateSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSettingsMutation, { data, loading, error }] = useUpdateSettingsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSettingsMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateSettingsMutation,
    UpdateSettingsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateSettingsMutation,
    UpdateSettingsMutationVariables
  >(UpdateSettingsDocument, options);
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
