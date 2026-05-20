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
  company: CompanyType;
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
  match: MatchAnalysisType;
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

export type QueryCompanyArgs = { id: Scalars["ID"]["input"] };

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
};

export type JobsQueryVariables = Exact<{
  filter?: InputMaybe<JobQuickFilter>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type JobsQuery = {
  __typename?: "Query";
  jobs: Array<{
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
    salary: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
    };
  }>;
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
    salary: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
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
    salary: {
      __typename?: "JobSalary";
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
    salary: {
      __typename?: "JobSalary";
      minCents?: number | null;
      maxCents?: number | null;
      currency?: string | null;
      period?: SalaryPeriod | null;
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
  match: {
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
  };
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
export const DeleteCompanyDocument = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      success
      deletedId
    }
  }
`;
export const CompanyJobsCountDocument = gql`
  query CompanyJobsCount($id: ID!) {
    companyJobsCount(id: $id)
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
export const CompanyDocument = gql`
  query Company($id: ID!) {
    company(id: $id) {
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
export const DraftJobsListDocument = gql`
  query DraftJobsList {
    draftJobs {
      id
      jobId
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
export const DraftJobDetailDocument = gql`
  query DraftJobDetail($id: ID!) {
    draftJob(id: $id) {
      id
      jobId
      url
      title
      htmlContent
      conversionMetadata {
        status
        error
        timestamp
      }
      createdAt
      match {
        id
        jobId
        draftJobId
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
      }
    }
  }
`;
export const DeleteDraftJobDocument = gql`
  mutation DeleteDraftJob($id: ID!, $deleteLinkedJob: Boolean) {
    deleteDraftJob(id: $id, deleteLinkedJob: $deleteLinkedJob) {
      success
      deletedId
    }
  }
`;
export const DeleteJobsForDraftDocument = gql`
  mutation DeleteJobsForDraft($draftId: ID!) {
    deleteJobsForDraft(draftId: $draftId) {
      success
      deletedId
    }
  }
`;
export const CreateJobWithAiDocument = gql`
  mutation CreateJobWithAI($draftId: ID!) {
    createJobWithAI(draftId: $draftId) {
      id
      title
      conversionMetadata {
        status
        error
      }
    }
  }
`;
export const CreateDraftJobDocument = gql`
  mutation CreateDraftJob($input: CreateDraftJobInput!) {
    createDraftJob(input: $input) {
      id
      jobId
      url
      title
      conversionMetadata {
        status
        error
      }
    }
  }
`;
export const UpdateDraftJobDocument = gql`
  mutation UpdateDraftJob($id: ID!, $input: UpdateDraftJobInput!) {
    updateDraftJob(id: $id, input: $input) {
      id
      jobId
      url
      title
      conversionMetadata {
        status
        error
      }
    }
  }
`;
export const JobsDocument = gql`
  query Jobs($filter: JobQuickFilter, $company: String, $runId: ID) {
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
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      match {
        id
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
      currentStage
      currentStageReason
      currentStageAt
      createdAt
      draftJobId
      match {
        id
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
export const GenerateCompanyDescriptionDocument = gql`
  query GenerateCompanyDescription($companyName: String!) {
    generateCompanyDescription(companyName: $companyName)
  }
`;
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
export const RemoveJobTagDocument = gql`
  mutation RemoveJobTag($id: ID!, $tag: String!) {
    removeJobTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;
export const DeleteJobDocument = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      success
      deletedId
    }
  }
`;
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
export const DeleteJobStageEventDocument = gql`
  mutation DeleteJobStageEvent($id: ID!) {
    deleteJobStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;
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
export const DeleteJobNoteDocument = gql`
  mutation DeleteJobNote($id: ID!) {
    deleteJobNote(id: $id) {
      success
      deletedId
    }
  }
`;
export const GenerateJobNoteWithAiDocument = gql`
  query GenerateJobNoteWithAi($jobId: ID!, $note: String!) {
    generateJobNoteWithAI(jobId: $jobId, note: $note)
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
export const GenerateJobLocationWithAiDocument = gql`
  query GenerateJobLocationWithAi($jobId: ID!) {
    generateJobLocationWithAI(jobId: $jobId)
  }
`;
export const GenerateJobWorkRegionWithAiDocument = gql`
  query GenerateJobWorkRegionWithAi($jobId: ID!) {
    generateJobWorkRegionWithAI(jobId: $jobId)
  }
`;
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
export const MatchAnalysesListDocument = gql`
  query MatchAnalysesList {
    matchAnalyses {
      id
      jobId
      draftJobId
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
      draftJob {
        id
        title
      }
    }
  }
`;
export const MatchDocument = gql`
  query Match($id: ID!) {
    match(id: $id) {
      id
      jobId
      draftJobId
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
      draftJob {
        id
        title
      }
    }
  }
`;
export const JobMatchDocument = gql`
  query JobMatch($jobId: ID!) {
    jobMatch(jobId: $jobId) {
      id
      jobId
      draftJobId
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
export const DraftJobMatchDocument = gql`
  query DraftJobMatch($draftJobId: ID!) {
    draftJobMatch(draftJobId: $draftJobId) {
      id
      jobId
      draftJobId
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
export const GenerateJobMatchDocument = gql`
  mutation GenerateJobMatch($input: GenerateMatchInput!) {
    generateJobMatch(input: $input) {
      id
      jobId
      draftJobId
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
export const GenerateDraftJobMatchDocument = gql`
  mutation GenerateDraftJobMatch($input: GenerateDraftMatchInput!) {
    generateDraftJobMatch(input: $input) {
      id
      jobId
      draftJobId
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
export const DeleteMatchAnalysisDocument = gql`
  mutation DeleteMatchAnalysis($id: ID!) {
    deleteMatchAnalysis(id: $id) {
      success
      deletedId
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
export const SourceProfilesListDocument = gql`
  query SourceProfilesList {
    sourceProfiles(onlyWithSourceTemplate: true) {
      sourceProfileId
      name
    }
  }
`;
export const SourceProfilesForNewSourcePickerDocument = gql`
  query SourceProfilesForNewSourcePicker {
    sourceProfiles(onlyWithSourceTemplate: false) {
      sourceProfileId
      name
    }
  }
`;
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
export const DeleteSourceTemplateDocument = gql`
  mutation DeleteSourceTemplate($id: ID!) {
    deleteSourceTemplate(id: $id) {
      success
      deletedId
    }
  }
`;
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
export const WorkPreferencesDocument = gql`
  query WorkPreferences {
    workPreferences {
      text
      weight
    }
  }
`;
export const UpdateWorkPreferencesDocument = gql`
  mutation UpdateWorkPreferences($items: [PreferenceInput!]!) {
    updateWorkPreferences(items: $items) {
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
    CompanyJobsCount(
      variables: CompanyJobsCountQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CompanyJobsCountQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CompanyJobsCountQuery>({
            document: CompanyJobsCountDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CompanyJobsCount",
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
    Company(
      variables: CompanyQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CompanyQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CompanyQuery>({
            document: CompanyDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Company",
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
    DraftJobsList(
      variables?: DraftJobsListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DraftJobsListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DraftJobsListQuery>({
            document: DraftJobsListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DraftJobsList",
        "query",
        variables,
      );
    },
    DraftJobDetail(
      variables: DraftJobDetailQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DraftJobDetailQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DraftJobDetailQuery>({
            document: DraftJobDetailDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DraftJobDetail",
        "query",
        variables,
      );
    },
    DeleteDraftJob(
      variables: DeleteDraftJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteDraftJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteDraftJobMutation>({
            document: DeleteDraftJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteDraftJob",
        "mutation",
        variables,
      );
    },
    DeleteJobsForDraft(
      variables: DeleteJobsForDraftMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteJobsForDraftMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteJobsForDraftMutation>({
            document: DeleteJobsForDraftDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteJobsForDraft",
        "mutation",
        variables,
      );
    },
    CreateJobWithAI(
      variables: CreateJobWithAiMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateJobWithAiMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateJobWithAiMutation>({
            document: CreateJobWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateJobWithAI",
        "mutation",
        variables,
      );
    },
    CreateDraftJob(
      variables: CreateDraftJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateDraftJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateDraftJobMutation>({
            document: CreateDraftJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateDraftJob",
        "mutation",
        variables,
      );
    },
    UpdateDraftJob(
      variables: UpdateDraftJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateDraftJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateDraftJobMutation>({
            document: UpdateDraftJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateDraftJob",
        "mutation",
        variables,
      );
    },
    Jobs(
      variables?: JobsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<JobsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<JobsQuery>({
            document: JobsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Jobs",
        "query",
        variables,
      );
    },
    Job(
      variables: JobQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<JobQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<JobQuery>({
            document: JobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Job",
        "query",
        variables,
      );
    },
    CreateJob(
      variables: CreateJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateJobMutation>({
            document: CreateJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateJob",
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
    UpdateJob(
      variables: UpdateJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateJobMutation>({
            document: UpdateJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateJob",
        "mutation",
        variables,
      );
    },
    RemoveJobTag(
      variables: RemoveJobTagMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<RemoveJobTagMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<RemoveJobTagMutation>({
            document: RemoveJobTagDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "RemoveJobTag",
        "mutation",
        variables,
      );
    },
    DeleteJob(
      variables: DeleteJobMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteJobMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteJobMutation>({
            document: DeleteJobDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteJob",
        "mutation",
        variables,
      );
    },
    JobStageEvents(
      variables: JobStageEventsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<JobStageEventsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<JobStageEventsQuery>({
            document: JobStageEventsDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "JobStageEvents",
        "query",
        variables,
      );
    },
    CreateJobStageEvent(
      variables: CreateJobStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateJobStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateJobStageEventMutation>({
            document: CreateJobStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateJobStageEvent",
        "mutation",
        variables,
      );
    },
    UpdateJobStageEvent(
      variables: UpdateJobStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateJobStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateJobStageEventMutation>({
            document: UpdateJobStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateJobStageEvent",
        "mutation",
        variables,
      );
    },
    DeleteJobStageEvent(
      variables: DeleteJobStageEventMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteJobStageEventMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteJobStageEventMutation>({
            document: DeleteJobStageEventDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteJobStageEvent",
        "mutation",
        variables,
      );
    },
    JobNotes(
      variables: JobNotesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<JobNotesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<JobNotesQuery>({
            document: JobNotesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "JobNotes",
        "query",
        variables,
      );
    },
    CreateJobNote(
      variables: CreateJobNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateJobNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateJobNoteMutation>({
            document: CreateJobNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateJobNote",
        "mutation",
        variables,
      );
    },
    UpdateJobNote(
      variables: UpdateJobNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateJobNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateJobNoteMutation>({
            document: UpdateJobNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateJobNote",
        "mutation",
        variables,
      );
    },
    DeleteJobNote(
      variables: DeleteJobNoteMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteJobNoteMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteJobNoteMutation>({
            document: DeleteJobNoteDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteJobNote",
        "mutation",
        variables,
      );
    },
    GenerateJobNoteWithAi(
      variables: GenerateJobNoteWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateJobNoteWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateJobNoteWithAiQuery>({
            document: GenerateJobNoteWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateJobNoteWithAi",
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
    GenerateJobLocationWithAi(
      variables: GenerateJobLocationWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateJobLocationWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateJobLocationWithAiQuery>({
            document: GenerateJobLocationWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateJobLocationWithAi",
        "query",
        variables,
      );
    },
    GenerateJobWorkRegionWithAi(
      variables: GenerateJobWorkRegionWithAiQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateJobWorkRegionWithAiQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateJobWorkRegionWithAiQuery>({
            document: GenerateJobWorkRegionWithAiDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateJobWorkRegionWithAi",
        "query",
        variables,
      );
    },
    GenerateJobSummary(
      variables: GenerateJobSummaryMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateJobSummaryMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateJobSummaryMutation>({
            document: GenerateJobSummaryDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateJobSummary",
        "mutation",
        variables,
      );
    },
    MatchAnalysesList(
      variables?: MatchAnalysesListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<MatchAnalysesListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MatchAnalysesListQuery>({
            document: MatchAnalysesListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "MatchAnalysesList",
        "query",
        variables,
      );
    },
    Match(
      variables: MatchQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<MatchQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<MatchQuery>({
            document: MatchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "Match",
        "query",
        variables,
      );
    },
    JobMatch(
      variables: JobMatchQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<JobMatchQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<JobMatchQuery>({
            document: JobMatchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "JobMatch",
        "query",
        variables,
      );
    },
    DraftJobMatch(
      variables: DraftJobMatchQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DraftJobMatchQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DraftJobMatchQuery>({
            document: DraftJobMatchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DraftJobMatch",
        "query",
        variables,
      );
    },
    GenerateJobMatch(
      variables: GenerateJobMatchMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateJobMatchMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateJobMatchMutation>({
            document: GenerateJobMatchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateJobMatch",
        "mutation",
        variables,
      );
    },
    GenerateDraftJobMatch(
      variables: GenerateDraftJobMatchMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<GenerateDraftJobMatchMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GenerateDraftJobMatchMutation>({
            document: GenerateDraftJobMatchDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "GenerateDraftJobMatch",
        "mutation",
        variables,
      );
    },
    DeleteMatchAnalysis(
      variables: DeleteMatchAnalysisMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteMatchAnalysisMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteMatchAnalysisMutation>({
            document: DeleteMatchAnalysisDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteMatchAnalysis",
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
    SourceProfilesList(
      variables?: SourceProfilesListQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SourceProfilesListQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SourceProfilesListQuery>({
            document: SourceProfilesListDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "SourceProfilesList",
        "query",
        variables,
      );
    },
    SourceProfilesForNewSourcePicker(
      variables?: SourceProfilesForNewSourcePickerQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SourceProfilesForNewSourcePickerQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SourceProfilesForNewSourcePickerQuery>({
            document: SourceProfilesForNewSourcePickerDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "SourceProfilesForNewSourcePicker",
        "query",
        variables,
      );
    },
    SourcesForSourceProfile(
      variables: SourcesForSourceProfileQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<SourcesForSourceProfileQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<SourcesForSourceProfileQuery>({
            document: SourcesForSourceProfileDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "SourcesForSourceProfile",
        "query",
        variables,
      );
    },
    UpdateSourceTemplate(
      variables: UpdateSourceTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateSourceTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateSourceTemplateMutation>({
            document: UpdateSourceTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateSourceTemplate",
        "mutation",
        variables,
      );
    },
    DeleteSourceTemplate(
      variables: DeleteSourceTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<DeleteSourceTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<DeleteSourceTemplateMutation>({
            document: DeleteSourceTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "DeleteSourceTemplate",
        "mutation",
        variables,
      );
    },
    CreateSourceTemplate(
      variables: CreateSourceTemplateMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<CreateSourceTemplateMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<CreateSourceTemplateMutation>({
            document: CreateSourceTemplateDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "CreateSourceTemplate",
        "mutation",
        variables,
      );
    },
    WorkPreferences(
      variables?: WorkPreferencesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<WorkPreferencesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<WorkPreferencesQuery>({
            document: WorkPreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "WorkPreferences",
        "query",
        variables,
      );
    },
    UpdateWorkPreferences(
      variables: UpdateWorkPreferencesMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
      signal?: RequestInit["signal"],
    ): Promise<UpdateWorkPreferencesMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<UpdateWorkPreferencesMutation>({
            document: UpdateWorkPreferencesDocument,
            variables,
            requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders },
            signal,
          }),
        "UpdateWorkPreferences",
        "mutation",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
