/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
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
  status: DraftJobConversionStatus;
  timestamp?: Maybe<Scalars["String"]["output"]>;
};

export type CreateDraftJobInput = {
  htmlContent: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateJobInput = {
  company: Scalars["String"]["input"];
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<JobSource>;
  sourceRunId?: InputMaybe<Scalars["ID"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateJobStageEventInput = {
  jobId: Scalars["String"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  toStage: JobStage;
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

export enum DraftJobConversionStatus {
  Failed = "FAILED",
  Idle = "IDLE",
  Processing = "PROCESSING",
  Succeeded = "SUCCEEDED",
}

export type DraftJobType = {
  __typename?: "DraftJobType";
  conversionMetadata?: Maybe<ConversionMetadataType>;
  createdAt: Scalars["DateTime"]["output"];
  htmlContent: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  jobId?: Maybe<Scalars["String"]["output"]>;
  match?: Maybe<MatchAnalysisType>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
};

export type ExchangeRate = {
  __typename?: "ExchangeRate";
  currency: Scalars["String"]["output"];
  rate: Scalars["Float"]["output"];
};

export type GenerateDraftMatchInput = {
  draftJobId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export type GenerateMatchInput = {
  jobId: Scalars["ID"]["input"];
  resumeId: Scalars["ID"]["input"];
};

export enum JobQuickFilter {
  Active = "ACTIVE",
  Applied = "APPLIED",
  Duplicated = "DUPLICATED",
  Incoming = "INCOMING",
  New = "NEW",
}

export type JobSalary = {
  __typename?: "JobSalary";
  currency?: Maybe<Scalars["String"]["output"]>;
  maxCents?: Maybe<Scalars["Int"]["output"]>;
  minCents?: Maybe<Scalars["Int"]["output"]>;
  period?: Maybe<SalaryPeriod>;
};

export enum JobSource {
  Jack = "JACK",
  Linkedin = "LINKEDIN",
  RemoteYeah = "REMOTE_YEAH",
  Wellfound = "WELLFOUND",
}

export enum JobStage {
  Applied = "APPLIED",
  CulturalFit = "CULTURAL_FIT",
  Duplicated = "DUPLICATED",
  New = "NEW",
  Offer = "OFFER",
  RecruiterScreen = "RECRUITER_SCREEN",
  Rejected = "REJECTED",
  Technical = "TECHNICAL",
}

export type JobStageEventType = {
  __typename?: "JobStageEventType";
  createdAt: Scalars["DateTime"]["output"];
  fromStage?: Maybe<JobStage>;
  id: Scalars["ID"]["output"];
  jobId: Scalars["String"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  scheduledAt?: Maybe<Scalars["DateTime"]["output"]>;
  source: Scalars["String"]["output"];
  toStage: JobStage;
  userId: Scalars["String"]["output"];
};

export type JobType = {
  __typename?: "JobType";
  company: CompanyType;
  companyId: Scalars["ID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  currentStage: JobStage;
  currentStageAt: Scalars["DateTime"]["output"];
  currentStageReason?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  draftJobId?: Maybe<Scalars["ID"]["output"]>;
  id: Scalars["ID"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  match?: Maybe<MatchAnalysisType>;
  salary: JobSalary;
  source?: Maybe<JobSource>;
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

export type MatchAnalysisType = {
  __typename?: "MatchAnalysisType";
  classification?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  draftJob?: Maybe<DraftJobType>;
  draftJobId?: Maybe<Scalars["ID"]["output"]>;
  gapCount: Scalars["Int"]["output"];
  generationMetadata?: Maybe<AsyncMetadataType>;
  id: Scalars["ID"]["output"];
  items: Array<MatchItemType>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars["ID"]["output"]>;
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
  source: Scalars["String"]["output"];
  sourceQuotes: Array<Scalars["String"]["output"]>;
  suggestion?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  verdict: Scalars["String"]["output"];
  weight?: Maybe<Scalars["String"]["output"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  claimSourceRun?: Maybe<SourceRunType>;
  clearSourceRuns: Scalars["Boolean"]["output"];
  createDraftJob: DraftJobType;
  createJob: JobType;
  createJobNote: NoteType;
  createJobStageEvent: JobStageEventType;
  createJobWithAI: DraftJobType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deleteCompany: DeleteMutationPayloadType;
  deleteDraftJob: DeleteMutationPayloadType;
  deleteJob: DeleteMutationPayloadType;
  deleteJobNote: DeleteMutationPayloadType;
  deleteJobStageEvent: DeleteMutationPayloadType;
  deleteJobsForDraft: DeleteMutationPayloadType;
  deleteMatchAnalysis: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachJobsFromSourceRun: Scalars["Int"]["output"];
  generateDraftJobMatch: MatchAnalysisType;
  generateJobMatch: MatchAnalysisType;
  generateJobSummary: JobType;
  removeJobTag: JobType;
  rerunSourceTemplate: SourceRunType;
  updateCompany: CompanyType;
  updateDraftJob: DraftJobType;
  updateJob: JobType;
  updateJobNote: NoteType;
  updateJobStageEvent: JobStageEventType;
  updateResume: ResumeType;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateSourceTemplate: SourceTemplateType;
  updateWorkPreferences: Array<PreferenceType>;
};

export type MutationClaimSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationCreateDraftJobArgs = { input: CreateDraftJobInput };

export type MutationCreateJobArgs = { input: CreateJobInput };

export type MutationCreateJobNoteArgs = { input: CreateNoteInput };

export type MutationCreateJobStageEventArgs = {
  input: CreateJobStageEventInput;
};

export type MutationCreateJobWithAiArgs = { draftId: Scalars["ID"]["input"] };

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationCreateSourceRunArgs = { input: CreateSourceRunInput };

export type MutationCreateSourceTemplateArgs = {
  input: CreateSourceTemplateInput;
};

export type MutationDeleteCompanyArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteDraftJobArgs = {
  deleteLinkedJob?: InputMaybe<Scalars["Boolean"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteJobArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobNoteArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobStageEventArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobsForDraftArgs = {
  draftId: Scalars["ID"]["input"];
};

export type MutationDeleteMatchAnalysisArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteResumeArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceTemplateArgs = { id: Scalars["ID"]["input"] };

export type MutationDetachJobsFromSourceRunArgs = {
  sourceRunId: Scalars["ID"]["input"];
};

export type MutationGenerateDraftJobMatchArgs = {
  input: GenerateDraftMatchInput;
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

export type MutationUpdateDraftJobArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateDraftJobInput;
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
  companyJobsCount: Scalars["Int"]["output"];
  draftJob: DraftJobType;
  draftJobMatch?: Maybe<MatchAnalysisType>;
  draftJobs: Array<DraftJobType>;
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
  match?: Maybe<MatchAnalysisType>;
  matchAnalyses: Array<MatchAnalysisType>;
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

export type QueryCompanyJobsCountArgs = { id: Scalars["ID"]["input"] };

export type QueryDraftJobArgs = { id: Scalars["ID"]["input"] };

export type QueryDraftJobMatchArgs = { draftJobId: Scalars["ID"]["input"] };

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
  filter?: InputMaybe<JobQuickFilter>;
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

export type UpdateCompanyInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateDraftJobInput = { title: Scalars["String"]["input"] };

export type UpdateJobInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<JobSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
  workRegion?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateJobStageEventInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  toStage?: InputMaybe<JobStage>;
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

export type DraftJobsListQueryVariables = Exact<{ [key: string]: never }>;

export type DraftJobsListQuery = {
  __typename?: "Query";
  draftJobs: Array<{
    __typename?: "DraftJobType";
    id: string;
    jobId?: string | null;
    url?: string | null;
    title: string;
    createdAt: any;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftJobConversionStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
  }>;
};

export type DraftJobDetailQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DraftJobDetailQuery = {
  __typename?: "Query";
  draftJob: {
    __typename?: "DraftJobType";
    id: string;
    jobId?: string | null;
    url?: string | null;
    title: string;
    htmlContent: string;
    createdAt: any;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftJobConversionStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
    match?: {
      __typename?: "MatchAnalysisType";
      id: string;
      jobId?: string | null;
      draftJobId?: string | null;
      resumeId: string;
      scoreRatio?: number | null;
      classification?: string | null;
      matchCount: number;
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

export type DeleteDraftJobMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  deleteLinkedJob?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type DeleteDraftJobMutation = {
  __typename?: "Mutation";
  deleteDraftJob: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type DeleteJobsForDraftMutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type DeleteJobsForDraftMutation = {
  __typename?: "Mutation";
  deleteJobsForDraft: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CreateJobWithAiMutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type CreateJobWithAiMutation = {
  __typename?: "Mutation";
  createJobWithAI: {
    __typename?: "DraftJobType";
    id: string;
    title: string;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftJobConversionStatus;
      error?: string | null;
    } | null;
  };
};

export type CreateDraftJobMutationVariables = Exact<{
  input: CreateDraftJobInput;
}>;

export type CreateDraftJobMutation = {
  __typename?: "Mutation";
  createDraftJob: {
    __typename?: "DraftJobType";
    id: string;
    jobId?: string | null;
    url?: string | null;
    title: string;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftJobConversionStatus;
      error?: string | null;
    } | null;
  };
};

export type UpdateDraftJobMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateDraftJobInput;
}>;

export type UpdateDraftJobMutation = {
  __typename?: "Mutation";
  updateDraftJob: {
    __typename?: "DraftJobType";
    id: string;
    jobId?: string | null;
    url?: string | null;
    title: string;
    conversionMetadata?: {
      __typename?: "ConversionMetadataType";
      status: DraftJobConversionStatus;
      error?: string | null;
    } | null;
  };
};

export type JobSalarySelectionFragment = {
  __typename?: "JobType";
  salary: {
    __typename?: "JobSalary";
    minCents?: number | null;
    maxCents?: number | null;
    currency?: string | null;
    period?: SalaryPeriod | null;
  };
} & { " $fragmentName"?: "JobSalarySelectionFragment" };

export type JobsQueryVariables = Exact<{
  filter?: InputMaybe<JobQuickFilter>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type JobsQuery = {
  __typename?: "Query";
  jobs: Array<
    {
      __typename?: "JobType";
      id: string;
      title: string;
      companyId: string;
      description?: string | null;
      urls: Array<string>;
      source?: JobSource | null;
      tags: Array<string>;
      location?: string | null;
      workRegion?: string | null;
      sourceRunId?: string | null;
      summary?: string | null;
      currentStage: JobStage;
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
      match?: {
        __typename?: "MatchAnalysisType";
        id: string;
        scoreRatio?: number | null;
        classification?: string | null;
        matchCount: number;
        gapCount: number;
        unclearCount: number;
        generationMetadata?: {
          __typename?: "AsyncMetadataType";
          status: AsyncMetadataStatus;
          error?: string | null;
          timestamp?: string | null;
        } | null;
      } | null;
    } & {
      " $fragmentRefs"?: {
        JobSalarySelectionFragment: JobSalarySelectionFragment;
      };
    }
  >;
};

export type JobQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type JobQuery = {
  __typename?: "Query";
  job: {
    __typename?: "JobType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
    tags: Array<string>;
    location?: string | null;
    workRegion?: string | null;
    sourceRunId?: string | null;
    summary?: string | null;
    currentStage: JobStage;
    currentStageReason?: string | null;
    currentStageAt: any;
    createdAt: any;
    draftJobId?: string | null;
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
    match?: {
      __typename?: "MatchAnalysisType";
      id: string;
      scoreRatio?: number | null;
      classification?: string | null;
      matchCount: number;
      gapCount: number;
      unclearCount: number;
      generationMetadata?: {
        __typename?: "AsyncMetadataType";
        status: AsyncMetadataStatus;
        error?: string | null;
        timestamp?: string | null;
      } | null;
    } | null;
  } & {
    " $fragmentRefs"?: {
      JobSalarySelectionFragment: JobSalarySelectionFragment;
    };
  };
};

export type CreateJobMutationVariables = Exact<{ input: CreateJobInput }>;

export type CreateJobMutation = {
  __typename?: "Mutation";
  createJob: {
    __typename?: "JobType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
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
  } & {
    " $fragmentRefs"?: {
      JobSalarySelectionFragment: JobSalarySelectionFragment;
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

export type UpdateJobMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateJobInput;
}>;

export type UpdateJobMutation = {
  __typename?: "Mutation";
  updateJob: {
    __typename?: "JobType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    urls: Array<string>;
    source?: JobSource | null;
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
  } & {
    " $fragmentRefs"?: {
      JobSalarySelectionFragment: JobSalarySelectionFragment;
    };
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
    fromStage?: JobStage | null;
    toStage: JobStage;
    source: string;
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
    fromStage?: JobStage | null;
    toStage: JobStage;
    source: string;
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
    fromStage?: JobStage | null;
    toStage: JobStage;
    source: string;
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
      status: AsyncMetadataStatus;
      error?: string | null;
      timestamp?: string | null;
    } | null;
  };
};

export type MatchAnalysesListQueryVariables = Exact<{ [key: string]: never }>;

export type MatchAnalysesListQuery = {
  __typename?: "Query";
  matchAnalyses: Array<{
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
    job?: {
      __typename?: "JobType";
      id: string;
      title: string;
      company: { __typename?: "CompanyType"; id: string; name: string };
    } | null;
    draftJob?: {
      __typename?: "DraftJobType";
      id: string;
      title: string;
    } | null;
  }>;
};

export type MatchQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type MatchQuery = {
  __typename?: "Query";
  match?: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
      __typename?: "MatchItemType";
      requirement: string;
      source: string;
      weight?: string | null;
      type: string;
      verdict: string;
      jdQuote: string;
      sourceQuotes: Array<string>;
      suggestion?: string | null;
    }>;
    job?: {
      __typename?: "JobType";
      id: string;
      title: string;
      company: { __typename?: "CompanyType"; id: string; name: string };
    } | null;
    draftJob?: {
      __typename?: "DraftJobType";
      id: string;
      title: string;
    } | null;
  } | null;
};

export type JobMatchQueryVariables = Exact<{ jobId: Scalars["ID"]["input"] }>;

export type JobMatchQuery = {
  __typename?: "Query";
  jobMatch?: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
      __typename?: "MatchItemType";
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

export type DraftJobMatchQueryVariables = Exact<{
  draftJobId: Scalars["ID"]["input"];
}>;

export type DraftJobMatchQuery = {
  __typename?: "Query";
  draftJobMatch?: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
      __typename?: "MatchItemType";
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

export type GenerateJobMatchMutationVariables = Exact<{
  input: GenerateMatchInput;
}>;

export type GenerateJobMatchMutation = {
  __typename?: "Mutation";
  generateJobMatch: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
      __typename?: "MatchItemType";
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

export type GenerateDraftJobMatchMutationVariables = Exact<{
  input: GenerateDraftMatchInput;
}>;

export type GenerateDraftJobMatchMutation = {
  __typename?: "Mutation";
  generateDraftJobMatch: {
    __typename?: "MatchAnalysisType";
    id: string;
    jobId?: string | null;
    draftJobId?: string | null;
    resumeId: string;
    scoreRatio?: number | null;
    classification?: string | null;
    matchCount: number;
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
      __typename?: "MatchItemType";
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

export const JobSalarySelectionFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "JobSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "JobType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "salary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "minCents" } },
                { kind: "Field", name: { kind: "Name", value: "maxCents" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "period" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobSalarySelectionFragment, unknown>;
export const UpdateCompanyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateCompany" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateCompanyInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateCompany" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;
export const DeleteCompanyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteCompany" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteCompany" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCompanyMutation,
  DeleteCompanyMutationVariables
>;
export const CompanyJobsCountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CompanyJobsCount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "companyJobsCount" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CompanyJobsCountQuery,
  CompanyJobsCountQueryVariables
>;
export const CompaniesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Companies" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "companies" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CompaniesQuery, CompaniesQueryVariables>;
export const ExchangeRatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExchangeRates" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "base" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "currencies" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "String" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "exchangeRates" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "base" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "base" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "currencies" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "currencies" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "base" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rates" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "currency" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "rate" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExchangeRatesQuery, ExchangeRatesQueryVariables>;
export const DraftJobsListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftJobsList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "draftJobs" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DraftJobsListQuery, DraftJobsListQueryVariables>;
export const DraftJobDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftJobDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "draftJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "htmlContent" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "match" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "jobId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "draftJobId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resumeId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "generationMetadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "error" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scoreRatio" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classification" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "matchCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gapCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unclearCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DraftJobDetailQuery, DraftJobDetailQueryVariables>;
export const DeleteDraftJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteDraftJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "deleteLinkedJob" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteDraftJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "deleteLinkedJob" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "deleteLinkedJob" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteDraftJobMutation,
  DeleteDraftJobMutationVariables
>;
export const DeleteJobsForDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteJobsForDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "draftId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteJobsForDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "draftId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "draftId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteJobsForDraftMutation,
  DeleteJobsForDraftMutationVariables
>;
export const CreateJobWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateJobWithAI" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "draftId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createJobWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "draftId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "draftId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateJobWithAiMutation,
  CreateJobWithAiMutationVariables
>;
export const CreateDraftJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateDraftJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateDraftJobInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createDraftJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDraftJobMutation,
  CreateDraftJobMutationVariables
>;
export const UpdateDraftJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateDraftJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateDraftJobInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateDraftJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateDraftJobMutation,
  UpdateDraftJobMutationVariables
>;
export const JobsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Jobs" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "JobQuickFilter" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "company" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "runId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "jobs" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filter" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "filter" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "company" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "company" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "runId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "runId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "companyId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "company" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "urls" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "JobSalarySelection" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "workRegion" } },
                { kind: "Field", name: { kind: "Name", value: "sourceRunId" } },
                { kind: "Field", name: { kind: "Name", value: "summary" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summaryMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStage" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStageReason" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStageAt" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "match" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scoreRatio" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classification" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "matchCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gapCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unclearCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "generationMetadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "error" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "JobSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "JobType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "salary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "minCents" } },
                { kind: "Field", name: { kind: "Name", value: "maxCents" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "period" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobsQuery, JobsQueryVariables>;
export const JobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Job" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "job" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "companyId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "company" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "urls" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "JobSalarySelection" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "workRegion" } },
                { kind: "Field", name: { kind: "Name", value: "sourceRunId" } },
                { kind: "Field", name: { kind: "Name", value: "summary" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summaryMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStage" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStageReason" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "currentStageAt" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "match" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scoreRatio" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "classification" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "matchCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "gapCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unclearCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "generationMetadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "status" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "error" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "timestamp" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "JobSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "JobType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "salary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "minCents" } },
                { kind: "Field", name: { kind: "Name", value: "maxCents" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "period" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobQuery, JobQueryVariables>;
export const CreateJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateJobInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "companyId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "company" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "urls" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "JobSalarySelection" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "workRegion" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "JobSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "JobType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "salary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "minCents" } },
                { kind: "Field", name: { kind: "Name", value: "maxCents" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "period" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateJobMutation, CreateJobMutationVariables>;
export const GenerateCompanyDescriptionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateCompanyDescription" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "companyName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateCompanyDescription" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "companyName" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "companyName" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateCompanyDescriptionQuery,
  GenerateCompanyDescriptionQueryVariables
>;
export const UpdateJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateJobInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "companyId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "company" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "urls" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "JobSalarySelection" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "location" } },
                { kind: "Field", name: { kind: "Name", value: "workRegion" } },
                { kind: "Field", name: { kind: "Name", value: "summary" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summaryMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "JobSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "JobType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "salary" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "minCents" } },
                { kind: "Field", name: { kind: "Name", value: "maxCents" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "period" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateJobMutation, UpdateJobMutationVariables>;
export const RemoveJobTagDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveJobTag" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "tag" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeJobTag" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "tag" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "tag" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveJobTagMutation,
  RemoveJobTagMutationVariables
>;
export const DeleteJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteJob" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteJobMutation, DeleteJobMutationVariables>;
export const JobStageEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "JobStageEvents" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "jobStageEvents" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "fromStage" } },
                { kind: "Field", name: { kind: "Name", value: "toStage" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "scheduledAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobStageEventsQuery, JobStageEventsQueryVariables>;
export const CreateJobStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateJobStageEvent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateJobStageEventInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createJobStageEvent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "fromStage" } },
                { kind: "Field", name: { kind: "Name", value: "toStage" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "scheduledAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateJobStageEventMutation,
  CreateJobStageEventMutationVariables
>;
export const UpdateJobStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateJobStageEvent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateJobStageEventInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateJobStageEvent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "fromStage" } },
                { kind: "Field", name: { kind: "Name", value: "toStage" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "scheduledAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateJobStageEventMutation,
  UpdateJobStageEventMutationVariables
>;
export const DeleteJobStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteJobStageEvent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteJobStageEvent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteJobStageEventMutation,
  DeleteJobStageEventMutationVariables
>;
export const JobNotesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "JobNotes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "jobNotes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "revision" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobNotesQuery, JobNotesQueryVariables>;
export const CreateJobNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateJobNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateNoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createJobNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "revision" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateJobNoteMutation,
  CreateJobNoteMutationVariables
>;
export const UpdateJobNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateJobNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateNoteInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateJobNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "revision" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateJobNoteMutation,
  UpdateJobNoteMutationVariables
>;
export const DeleteJobNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteJobNote" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteJobNote" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteJobNoteMutation,
  DeleteJobNoteMutationVariables
>;
export const GenerateJobNoteWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateJobNoteWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateJobNoteWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateJobNoteWithAiQuery,
  GenerateJobNoteWithAiQueryVariables
>;
export const RewriteTextWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RewriteTextWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "text" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rewriteTextWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "text" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "text" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RewriteTextWithAiQuery,
  RewriteTextWithAiQueryVariables
>;
export const RestructureJobDescriptionWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RestructureJobDescriptionWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "text" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "restructureJobDescriptionWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "text" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "text" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RestructureJobDescriptionWithAiQuery,
  RestructureJobDescriptionWithAiQueryVariables
>;
export const GenerateJobLocationWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateJobLocationWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateJobLocationWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateJobLocationWithAiQuery,
  GenerateJobLocationWithAiQueryVariables
>;
export const GenerateJobWorkRegionWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateJobWorkRegionWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateJobWorkRegionWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateJobWorkRegionWithAiQuery,
  GenerateJobWorkRegionWithAiQueryVariables
>;
export const GenerateJobSummaryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateJobSummary" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateJobSummary" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "summary" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summaryMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateJobSummaryMutation,
  GenerateJobSummaryMutationVariables
>;
export const MatchAnalysesListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MatchAnalysesList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "matchAnalyses" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "job" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "company" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftJob" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MatchAnalysesListQuery,
  MatchAnalysesListQueryVariables
>;
export const MatchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Match" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "match" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirement" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "source" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weight" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "verdict" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "jdQuote" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceQuotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "suggestion" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "job" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "company" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftJob" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MatchQuery, MatchQueryVariables>;
export const JobMatchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "JobMatch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "jobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "jobMatch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "jobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "jobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirement" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "source" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weight" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "verdict" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "jdQuote" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceQuotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "suggestion" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JobMatchQuery, JobMatchQueryVariables>;
export const DraftJobMatchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftJobMatch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "draftJobId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "draftJobMatch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "draftJobId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "draftJobId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirement" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "source" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weight" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "verdict" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "jdQuote" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceQuotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "suggestion" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DraftJobMatchQuery, DraftJobMatchQueryVariables>;
export const GenerateJobMatchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateJobMatch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GenerateMatchInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateJobMatch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirement" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "source" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weight" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "verdict" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "jdQuote" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceQuotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "suggestion" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateJobMatchMutation,
  GenerateJobMatchMutationVariables
>;
export const GenerateDraftJobMatchDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateDraftJobMatch" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GenerateDraftMatchInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateDraftJobMatch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "jobId" } },
                { kind: "Field", name: { kind: "Name", value: "draftJobId" } },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "generationMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timestamp" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "matchCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requirement" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "source" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "weight" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "verdict" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "jdQuote" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceQuotes" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "suggestion" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateDraftJobMatchMutation,
  GenerateDraftJobMatchMutationVariables
>;
export const DeleteMatchAnalysisDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteMatchAnalysis" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteMatchAnalysis" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteMatchAnalysisMutation,
  DeleteMatchAnalysisMutationVariables
>;
export const MeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Me" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                { kind: "Field", name: { kind: "Name", value: "avatarUrl" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const ResumesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Resumes" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resumes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "isDefault" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResumesQuery, ResumesQueryVariables>;
export const ResumeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Resume" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resume" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "isDefault" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResumeQuery, ResumeQueryVariables>;
export const CreateResumeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateResume" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateResumeInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createResume" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "isDefault" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateResumeMutation,
  CreateResumeMutationVariables
>;
export const UpdateResumeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateResume" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateResumeInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateResume" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "isDefault" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateResumeMutation,
  UpdateResumeMutationVariables
>;
export const DeleteResumeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteResume" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteResume" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteResumeMutation,
  DeleteResumeMutationVariables
>;
export const SourceProfilesListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SourceProfilesList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sourceProfiles" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "onlyWithSourceTemplate" },
                value: { kind: "BooleanValue", value: true },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SourceProfilesListQuery,
  SourceProfilesListQueryVariables
>;
export const SourceProfilesForNewSourcePickerDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SourceProfilesForNewSourcePicker" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sourceProfiles" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "onlyWithSourceTemplate" },
                value: { kind: "BooleanValue", value: false },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SourceProfilesForNewSourcePickerQuery,
  SourceProfilesForNewSourcePickerQueryVariables
>;
export const SourcesForSourceProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SourcesForSourceProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sourceProfileId" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sourceTemplatesForSourceProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sourceProfileId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleCron" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleEnabled" },
                },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "runs" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startedAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SourcesForSourceProfileQuery,
  SourcesForSourceProfileQueryVariables
>;
export const UpdateSourceTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSourceTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateSourceTemplateInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSourceTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleCron" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleEnabled" },
                },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "runs" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startedAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSourceTemplateMutation,
  UpdateSourceTemplateMutationVariables
>;
export const DeleteSourceTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteSourceTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteSourceTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "deletedId" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSourceTemplateMutation,
  DeleteSourceTemplateMutationVariables
>;
export const CreateSourceTemplateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateSourceTemplate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateSourceTemplateInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createSourceTemplate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleCron" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "scheduleEnabled" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSourceTemplateMutation,
  CreateSourceTemplateMutationVariables
>;
export const WorkPreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WorkPreferences" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "workPreferences" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "weight" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  WorkPreferencesQuery,
  WorkPreferencesQueryVariables
>;
export const UpdateWorkPreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateWorkPreferences" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "items" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "PreferenceInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkPreferences" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "items" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "items" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "text" } },
                { kind: "Field", name: { kind: "Name", value: "weight" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkPreferencesMutation,
  UpdateWorkPreferencesMutationVariables
>;
