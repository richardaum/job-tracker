/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export enum ApplicationQuickFilter {
  Active = 'ACTIVE',
  Applied = 'APPLIED',
  Draft = 'DRAFT',
  Duplicated = 'DUPLICATED',
  Incoming = 'INCOMING',
  New = 'NEW'
}

export enum ApplicationStage {
  Applied = 'APPLIED',
  CulturalFit = 'CULTURAL_FIT',
  Draft = 'DRAFT',
  Duplicated = 'DUPLICATED',
  New = 'NEW',
  Offer = 'OFFER',
  RecruiterScreen = 'RECRUITER_SCREEN',
  Rejected = 'REJECTED',
  Technical = 'TECHNICAL'
}

export enum AsyncMetadataStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Processing = 'PROCESSING'
}

export type AsyncMetadataType = {
  __typename?: 'AsyncMetadataType';
  error?: Maybe<Scalars['String']['output']>;
  status?: Maybe<AsyncMetadataStatus>;
  timestamp?: Maybe<Scalars['DateTime']['output']>;
};

export type AuthAccount = {
  __typename?: 'AuthAccount';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  providerAccountId: Scalars['String']['output'];
  providerName: AuthProvider;
};

export enum AuthProvider {
  Google = 'GOOGLE'
}

export type CompanyType = {
  __typename?: 'CompanyType';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type CreateJobInput = {
  autoFill?: InputMaybe<Scalars['Boolean']['input']>;
  autoMatch?: InputMaybe<Scalars['Boolean']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  createAsDraftCapture?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  htmlContent?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  salary?: InputMaybe<JobSalaryInput>;
  source?: InputMaybe<JobSource>;
  sourceRunId?: InputMaybe<Scalars['ID']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  workRegion?: InputMaybe<Scalars['String']['input']>;
};

export type CreateJobStageEventInput = {
  jobId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
  source?: InputMaybe<StageEventSource>;
  toStage: ApplicationStage;
};

export type CreateNoteInput = {
  content: Scalars['String']['input'];
  jobId: Scalars['String']['input'];
};

export type CreateResumeInput = {
  content: Scalars['String']['input'];
  isDefault?: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
};

export type CreateSourceRunInput = {
  sourceProfileId: Scalars['String']['input'];
};

export type CreateSourceTemplateInput = {
  sourceProfileId: Scalars['String']['input'];
  surfaceUrl: Scalars['String']['input'];
};

export type CurrencyRates = {
  __typename?: 'CurrencyRates';
  base: Scalars['String']['output'];
  rates: Array<ExchangeRate>;
};

export type DeleteMutationPayloadType = {
  __typename?: 'DeleteMutationPayloadType';
  deletedId: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
};

export type ExchangeRate = {
  __typename?: 'ExchangeRate';
  currency: Scalars['String']['output'];
  rate: Scalars['Float']['output'];
};

export type ExtensionActivityEvent = {
  __typename?: 'ExtensionActivityEvent';
  /** Browser user-agent or name. */
  browser?: Maybe<Scalars['String']['output']>;
  /** Groups related events (e.g. run ID). */
  correlationId?: Maybe<Scalars['String']['output']>;
  /** Extension version that reported the event. */
  extensionVersion?: Maybe<Scalars['String']['output']>;
  /** Unique event identifier. */
  id: Scalars['ID']['output'];
  /** When the event actually happened (client-reported). */
  occurredAt: Scalars['DateTime']['output'];
  /** Arbitrary JSON payload with event details. */
  payload?: Maybe<Scalars['JSON']['output']>;
  /** Human-readable summary of what happened. */
  summary: Scalars['String']['output'];
  /** Event category (source run lifecycle, import, auth). */
  type: ExtensionActivityEventType;
};

export enum ExtensionActivityEventType {
  AuthFailed = 'AuthFailed',
  AuthRefreshed = 'AuthRefreshed',
  ImportJobCompleted = 'ImportJobCompleted',
  ImportJobFailed = 'ImportJobFailed',
  ImportJobStarted = 'ImportJobStarted',
  SourceRunClaimSkipped = 'SourceRunClaimSkipped',
  SourceRunCompleted = 'SourceRunCompleted',
  SourceRunFailed = 'SourceRunFailed',
  SourceRunJobImported = 'SourceRunJobImported',
  SourceRunReceived = 'SourceRunReceived',
  SourceRunStarted = 'SourceRunStarted'
}

export enum FitClassification {
  Negative = 'Negative',
  Neutral = 'Neutral',
  Positive = 'Positive'
}

export type GenerateMatchInput = {
  jobId: Scalars['ID']['input'];
  resumeId: Scalars['ID']['input'];
};

export type JobFillStatusEventType = {
  __typename?: 'JobFillStatusEventType';
  error?: Maybe<Scalars['String']['output']>;
  jobId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

export type JobMatchStatusEventType = {
  __typename?: 'JobMatchStatusEventType';
  jobId: Scalars['ID']['output'];
  matchId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

export type JobSalary = {
  __typename?: 'JobSalary';
  currency?: Maybe<Scalars['String']['output']>;
  maxCents?: Maybe<Scalars['Int']['output']>;
  minCents?: Maybe<Scalars['Int']['output']>;
  period?: Maybe<SalaryPeriod>;
};

export type JobSalaryInput = {
  currency?: InputMaybe<Scalars['String']['input']>;
  maxCents?: InputMaybe<Scalars['Int']['input']>;
  minCents?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<SalaryPeriod>;
};

export enum JobSource {
  Jack = 'JACK',
  Linkedin = 'LINKEDIN',
  RemoteYeah = 'REMOTE_YEAH',
  Wellfound = 'WELLFOUND'
}

export type JobStageEventType = {
  __typename?: 'JobStageEventType';
  createdAt: Scalars['DateTime']['output'];
  fromStage?: Maybe<ApplicationStage>;
  id: Scalars['ID']['output'];
  jobId: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  source: StageEventSource;
  toStage: ApplicationStage;
  userId: Scalars['String']['output'];
};

export type JobSummaryStatusEventType = {
  __typename?: 'JobSummaryStatusEventType';
  jobId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

export type JobType = {
  __typename?: 'JobType';
  company?: Maybe<CompanyType>;
  companyId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentStage: ApplicationStage;
  currentStageAt: Scalars['DateTime']['output'];
  currentStageReason?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fillMetadata?: Maybe<AsyncMetadataType>;
  htmlContent?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  match?: Maybe<MatchAnalysisType>;
  salary?: Maybe<JobSalary>;
  source?: Maybe<JobSource>;
  sourceRunId?: Maybe<Scalars['ID']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  summaryMetadata?: Maybe<AsyncMetadataType>;
  tags: Array<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  urls: Array<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  workRegion?: Maybe<Scalars['String']['output']>;
};

export type MatchAnalysisType = {
  __typename?: 'MatchAnalysisType';
  classification?: Maybe<FitClassification>;
  createdAt: Scalars['DateTime']['output'];
  gapCount: Scalars['Int']['output'];
  generationMetadata?: Maybe<AsyncMetadataType>;
  id: Scalars['ID']['output'];
  items: Array<MatchItemType>;
  job?: Maybe<JobType>;
  jobId: Scalars['ID']['output'];
  matchCount: Scalars['Int']['output'];
  resumeId: Scalars['ID']['output'];
  scoreRatio?: Maybe<Scalars['Float']['output']>;
  unclearCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MatchItemType = {
  __typename?: 'MatchItemType';
  id: Scalars['ID']['output'];
  jdQuote: Scalars['String']['output'];
  requirement: Scalars['String']['output'];
  source: MatchSource;
  sourceQuotes: Array<Scalars['String']['output']>;
  suggestion?: Maybe<Scalars['String']['output']>;
  type: RequirementType;
  verdict: MatchVerdict;
  weight?: Maybe<Weight>;
};

export enum MatchSource {
  Preference = 'Preference',
  Resume = 'Resume'
}

export enum MatchVerdict {
  Fit = 'Fit',
  Gap = 'Gap',
  Unclear = 'Unclear'
}

export type Mutation = {
  __typename?: 'Mutation';
  clearSourceRuns: Scalars['Boolean']['output'];
  createJob: JobType;
  createJobNote: NoteType;
  createJobStageEvent: JobStageEventType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deactivateAccount: Scalars['Boolean']['output'];
  deleteCompany: DeleteMutationPayloadType;
  deleteJob: DeleteMutationPayloadType;
  deleteJobNote: DeleteMutationPayloadType;
  deleteJobStageEvent: DeleteMutationPayloadType;
  deleteMatchAnalysis: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachJobsFromSourceRun: Scalars['Int']['output'];
  fillJobAutomatically: JobType;
  generateJobMatch: MatchAnalysisType;
  removeJobTag: JobType;
  reportExtensionActivity: ExtensionActivityEvent;
  requestJobSummary: JobType;
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


export type MutationCreateJobArgs = {
  input: CreateJobInput;
};


export type MutationCreateJobNoteArgs = {
  input: CreateNoteInput;
};


export type MutationCreateJobStageEventArgs = {
  input: CreateJobStageEventInput;
};


export type MutationCreateResumeArgs = {
  input: CreateResumeInput;
};


export type MutationCreateSourceRunArgs = {
  input: CreateSourceRunInput;
};


export type MutationCreateSourceTemplateArgs = {
  input: CreateSourceTemplateInput;
};


export type MutationDeleteCompanyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteJobArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteJobNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteJobStageEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMatchAnalysisArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteResumeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSourceRunArgs = {
  deleteJobs?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationDeleteSourceTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDetachJobsFromSourceRunArgs = {
  sourceRunId: Scalars['ID']['input'];
};


export type MutationFillJobAutomaticallyArgs = {
  jobId: Scalars['ID']['input'];
};


export type MutationGenerateJobMatchArgs = {
  input: GenerateMatchInput;
};


export type MutationRemoveJobTagArgs = {
  id: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
};


export type MutationReportExtensionActivityArgs = {
  input: ReportExtensionActivityInput;
};


export type MutationRequestJobSummaryArgs = {
  jobId: Scalars['ID']['input'];
};


export type MutationRerunSourceTemplateArgs = {
  templateId: Scalars['ID']['input'];
};


export type MutationUpdateCompanyArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCompanyInput;
};


export type MutationUpdateJobArgs = {
  id: Scalars['ID']['input'];
  input: UpdateJobInput;
};


export type MutationUpdateJobNoteArgs = {
  id: Scalars['ID']['input'];
  input: UpdateNoteInput;
};


export type MutationUpdateJobStageEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateJobStageEventInput;
};


export type MutationUpdateResumeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateResumeInput;
};


export type MutationUpdateSettingsArgs = {
  input: UpdateSettingsInput;
};


export type MutationUpdateSourceRunArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSourceRunInput;
};


export type MutationUpdateSourceRunStatusArgs = {
  id: Scalars['ID']['input'];
  status: SourceRunStatus;
};


export type MutationUpdateSourceTemplateArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSourceTemplateInput;
};


export type MutationUpdateWorkPreferencesArgs = {
  items: Array<PreferenceInput>;
};

export type NoteType = {
  __typename?: 'NoteType';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  jobId?: Maybe<Scalars['String']['output']>;
  revision: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type PreferenceInput = {
  text: Scalars['String']['input'];
  weight: Weight;
};

export type PreferenceType = {
  __typename?: 'PreferenceType';
  text: Scalars['String']['output'];
  weight: Weight;
};

export type Query = {
  __typename?: 'Query';
  companies: Array<CompanyType>;
  company: CompanyType;
  companyJobsCount: Scalars['Int']['output'];
  exchangeRates: CurrencyRates;
  extensionActivityEvents: Array<ExtensionActivityEvent>;
  generateCompanyDescription: Scalars['String']['output'];
  generateJobLocationWithAI?: Maybe<Scalars['String']['output']>;
  generateJobNoteWithAI: Scalars['String']['output'];
  generateJobWorkRegionWithAI?: Maybe<Scalars['String']['output']>;
  job: JobType;
  jobMatch?: Maybe<MatchAnalysisType>;
  jobNotes: Array<NoteType>;
  jobStageEvents: Array<JobStageEventType>;
  jobs: Array<JobType>;
  match: MatchAnalysisType;
  matchAnalyses: Array<MatchAnalysisType>;
  me: UserType;
  restructureJobDescriptionWithAI: Scalars['String']['output'];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars['String']['output'];
  settings: UserSetting;
  sourceProfiles: Array<SourceProfileType>;
  sourceRuns: Array<SourceRunType>;
  sourceTemplate: SourceTemplateType;
  sourceTemplates: Array<SourceTemplateType>;
  sourceTemplatesForSourceProfile: Array<SourceTemplateType>;
  users: Array<UserType>;
  workPreferences: Array<PreferenceType>;
};


export type QueryCompanyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCompanyJobsCountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExchangeRatesArgs = {
  base: Scalars['String']['input'];
  currencies: Array<Scalars['String']['input']>;
};


export type QueryExtensionActivityEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGenerateCompanyDescriptionArgs = {
  companyName: Scalars['String']['input'];
};


export type QueryGenerateJobLocationWithAiArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryGenerateJobNoteWithAiArgs = {
  jobId: Scalars['ID']['input'];
  note: Scalars['String']['input'];
};


export type QueryGenerateJobWorkRegionWithAiArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryJobArgs = {
  id: Scalars['ID']['input'];
};


export type QueryJobMatchArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryJobNotesArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryJobStageEventsArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryJobsArgs = {
  company?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ApplicationQuickFilter>;
  runId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRestructureJobDescriptionWithAiArgs = {
  text: Scalars['String']['input'];
};


export type QueryResumeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRewriteTextWithAiArgs = {
  text: Scalars['String']['input'];
};


export type QuerySourceProfilesArgs = {
  onlyWithSourceTemplate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySourceTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySourceTemplatesForSourceProfileArgs = {
  sourceProfileId: Scalars['String']['input'];
};

export type ReportExtensionActivityInput = {
  browser?: InputMaybe<Scalars['String']['input']>;
  correlationId?: InputMaybe<Scalars['String']['input']>;
  extensionVersion?: InputMaybe<Scalars['String']['input']>;
  occurredAt?: InputMaybe<Scalars['DateTime']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  summary: Scalars['String']['input'];
  type: ExtensionActivityEventType;
};

export enum RequirementType {
  MustHave = 'MustHave',
  NiceToHave = 'NiceToHave',
  SoftSkill = 'SoftSkill'
}

export type ResumeType = {
  __typename?: 'ResumeType';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export enum SalaryPeriod {
  Hour = 'HOUR',
  Month = 'MONTH',
  Year = 'YEAR'
}

export type SourceProfileType = {
  __typename?: 'SourceProfileType';
  name: Scalars['String']['output'];
  sourceProfileId: Scalars['String']['output'];
  templates: Array<SourceTemplateType>;
};

export type SourceRunEvent = {
  __typename?: 'SourceRunEvent';
  occurredAt: Scalars['DateTime']['output'];
  run: SourceRunType;
  type: SourceRunEventType;
};

export enum SourceRunEventType {
  SourceRunCreated = 'SOURCE_RUN_CREATED'
}

export enum SourceRunStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  Running = 'RUNNING'
}

export type SourceRunType = {
  __typename?: 'SourceRunType';
  id: Scalars['ID']['output'];
  sourceProfile: Scalars['String']['output'];
  sourceProfileId: Scalars['String']['output'];
  startedAt: Scalars['DateTime']['output'];
  status: SourceRunStatus;
  surfaceUrl: Scalars['String']['output'];
  templateId: Scalars['ID']['output'];
};

export type SourceTemplateType = {
  __typename?: 'SourceTemplateType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  runs: Array<SourceRunType>;
  scheduleCron?: Maybe<Scalars['String']['output']>;
  scheduleEnabled: Scalars['Boolean']['output'];
  sourceProfileId: Scalars['String']['output'];
  surfaceUrl: Scalars['String']['output'];
};

export enum StageEventSource {
  Manual = 'Manual',
  System = 'System'
}

export type Subscription = {
  __typename?: 'Subscription';
  extensionActivityEvents: ExtensionActivityEvent;
  jobFillStatusChanged: JobFillStatusEventType;
  jobMatchStatusChanged: JobMatchStatusEventType;
  jobSummaryStatusChanged: JobSummaryStatusEventType;
  sourceRunEvents: SourceRunEvent;
};


export type SubscriptionJobFillStatusChangedArgs = {
  jobId: Scalars['ID']['input'];
};


export type SubscriptionJobMatchStatusChangedArgs = {
  jobId: Scalars['ID']['input'];
};


export type SubscriptionJobSummaryStatusChangedArgs = {
  jobId: Scalars['ID']['input'];
};

export type UpdateCompanyInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateJobInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  htmlContent?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  salary?: InputMaybe<JobSalaryInput>;
  source?: InputMaybe<JobSource>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  workRegion?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateJobStageEventInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['DateTime']['input']>;
  toStage?: InputMaybe<ApplicationStage>;
};

export type UpdateNoteInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  expectedRevision: Scalars['Int']['input'];
};

export type UpdateResumeInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSettingsInput = {
  autoFillEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  autoMatchEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  autoSummaryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  duplicateWindowDays?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSourceRunInput = {
  surfaceUrl: Scalars['String']['input'];
};

export type UpdateSourceTemplateInput = {
  scheduleCron?: InputMaybe<Scalars['String']['input']>;
  scheduleEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  surfaceUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UserSetting = {
  __typename?: 'UserSetting';
  autoFillEnabled: Scalars['Boolean']['output'];
  autoMatchEnabled: Scalars['Boolean']['output'];
  autoSummaryEnabled: Scalars['Boolean']['output'];
  duplicateWindowDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  userId: Scalars['String']['output'];
};

export type UserType = {
  __typename?: 'UserType';
  accounts: Array<AuthAccount>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export enum Weight {
  High = 'High',
  Low = 'Low'
}

export type AdminSourceRunsListQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSourceRunsListQuery = { __typename?: 'Query', sourceRuns: Array<{ __typename?: 'SourceRunType', id: string, templateId: string, sourceProfileId: string, surfaceUrl: string, status: SourceRunStatus, startedAt: any, sourceProfile: string }> };

export type AdminExtensionActivityEventsListQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminExtensionActivityEventsListQuery = { __typename?: 'Query', extensionActivityEvents: Array<{ __typename?: 'ExtensionActivityEvent', id: string, type: ExtensionActivityEventType, summary: string, correlationId?: string | null, occurredAt: any }> };

export type AdminSourceRunEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AdminSourceRunEventsSubscription = { __typename?: 'Subscription', sourceRunEvents: { __typename?: 'SourceRunEvent', type: SourceRunEventType, occurredAt: any, run: { __typename?: 'SourceRunType', id: string, templateId: string, sourceProfileId: string, surfaceUrl: string, status: SourceRunStatus, startedAt: any, sourceProfile: string } } };

export type AdminExtensionActivityEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AdminExtensionActivityEventsSubscription = { __typename?: 'Subscription', extensionActivityEvents: { __typename?: 'ExtensionActivityEvent', id: string, type: ExtensionActivityEventType, summary: string, correlationId?: string | null, occurredAt: any } };

export type AdminUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserType', id: string, email: string, name: string, role: string, avatarUrl?: string | null }> };

export type AuthenticatedShellQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthenticatedShellQuery = { __typename?: 'Query', me: { __typename?: 'UserType', id: string, email: string, name: string, role: string, avatarUrl?: string | null, accounts: Array<{ __typename?: 'AuthAccount', id: string, providerName: AuthProvider, providerAccountId: string, createdAt: any }> }, settings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, duplicateWindowDays: number } };

export type UpdateCompanyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCompanyInput;
}>;


export type UpdateCompanyMutation = { __typename?: 'Mutation', updateCompany: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } };

export type DeleteCompanyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCompanyMutation = { __typename?: 'Mutation', deleteCompany: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type CompanyJobsCountQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CompanyJobsCountQuery = { __typename?: 'Query', companyJobsCount: number };

export type CompaniesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompaniesQuery = { __typename?: 'Query', companies: Array<{ __typename?: 'CompanyType', id: string, name: string, description?: string | null }> };

export type CompanyQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CompanyQuery = { __typename?: 'Query', company: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } };

export type ExchangeRatesQueryVariables = Exact<{
  base: Scalars['String']['input'];
  currencies: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ExchangeRatesQuery = { __typename?: 'Query', exchangeRates: { __typename?: 'CurrencyRates', base: string, rates: Array<{ __typename?: 'ExchangeRate', currency: string, rate: number }> } };

export type JobSalarySelectionFragment = { __typename?: 'JobType', salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null } & { ' $fragmentName'?: 'JobSalarySelectionFragment' };

export type JobsQueryVariables = Exact<{
  filter?: InputMaybe<ApplicationQuickFilter>;
  company?: InputMaybe<Scalars['String']['input']>;
  runId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type JobsQuery = { __typename?: 'Query', jobs: Array<(
    { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, sourceRunId?: string | null, summary?: string | null, currentStage: ApplicationStage, currentStageReason?: string | null, currentStageAt: any, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, match?: { __typename?: 'MatchAnalysisType', id: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } | null }
    & { ' $fragmentRefs'?: { 'JobSalarySelectionFragment': JobSalarySelectionFragment } }
  )> };

export type JobQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type JobQuery = { __typename?: 'Query', job: (
    { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, sourceRunId?: string | null, summary?: string | null, htmlContent?: string | null, currentStage: ApplicationStage, currentStageReason?: string | null, currentStageAt: any, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, match?: { __typename?: 'MatchAnalysisType', id: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } | null }
    & { ' $fragmentRefs'?: { 'JobSalarySelectionFragment': JobSalarySelectionFragment } }
  ) };

export type CreateJobMutationVariables = Exact<{
  input: CreateJobInput;
}>;


export type CreateJobMutation = { __typename?: 'Mutation', createJob: (
    { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null }
    & { ' $fragmentRefs'?: { 'JobSalarySelectionFragment': JobSalarySelectionFragment } }
  ) };

export type GenerateCompanyDescriptionQueryVariables = Exact<{
  companyName: Scalars['String']['input'];
}>;


export type GenerateCompanyDescriptionQuery = { __typename?: 'Query', generateCompanyDescription: string };

export type UpdateJobMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateJobInput;
}>;


export type UpdateJobMutation = { __typename?: 'Mutation', updateJob: (
    { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, summary?: string | null, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null }
    & { ' $fragmentRefs'?: { 'JobSalarySelectionFragment': JobSalarySelectionFragment } }
  ) };

export type RemoveJobTagMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
}>;


export type RemoveJobTagMutation = { __typename?: 'Mutation', removeJobTag: { __typename?: 'JobType', id: string, tags: Array<string> } };

export type DeleteJobMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteJobMutation = { __typename?: 'Mutation', deleteJob: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type JobStageEventsQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobStageEventsQuery = { __typename?: 'Query', jobStageEvents: Array<{ __typename?: 'JobStageEventType', id: string, jobId: string, fromStage?: ApplicationStage | null, toStage: ApplicationStage, source: StageEventSource, reason?: string | null, scheduledAt?: any | null, createdAt: any }> };

export type CreateJobStageEventMutationVariables = Exact<{
  input: CreateJobStageEventInput;
}>;


export type CreateJobStageEventMutation = { __typename?: 'Mutation', createJobStageEvent: { __typename?: 'JobStageEventType', id: string, jobId: string, fromStage?: ApplicationStage | null, toStage: ApplicationStage, source: StageEventSource, reason?: string | null, scheduledAt?: any | null, createdAt: any } };

export type UpdateJobStageEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateJobStageEventInput;
}>;


export type UpdateJobStageEventMutation = { __typename?: 'Mutation', updateJobStageEvent: { __typename?: 'JobStageEventType', id: string, jobId: string, fromStage?: ApplicationStage | null, toStage: ApplicationStage, source: StageEventSource, reason?: string | null, scheduledAt?: any | null, createdAt: any } };

export type DeleteJobStageEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteJobStageEventMutation = { __typename?: 'Mutation', deleteJobStageEvent: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type JobNotesQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobNotesQuery = { __typename?: 'Query', jobNotes: Array<{ __typename?: 'NoteType', id: string, jobId?: string | null, content: string, revision: number, createdAt: any, updatedAt: any }> };

export type CreateJobNoteMutationVariables = Exact<{
  input: CreateNoteInput;
}>;


export type CreateJobNoteMutation = { __typename?: 'Mutation', createJobNote: { __typename?: 'NoteType', id: string, jobId?: string | null, content: string, revision: number, createdAt: any, updatedAt: any } };

export type UpdateJobNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateNoteInput;
}>;


export type UpdateJobNoteMutation = { __typename?: 'Mutation', updateJobNote: { __typename?: 'NoteType', id: string, jobId?: string | null, content: string, revision: number, createdAt: any, updatedAt: any } };

export type DeleteJobNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteJobNoteMutation = { __typename?: 'Mutation', deleteJobNote: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type GenerateJobNoteWithAiQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
  note: Scalars['String']['input'];
}>;


export type GenerateJobNoteWithAiQuery = { __typename?: 'Query', generateJobNoteWithAI: string };

export type RewriteTextWithAiQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type RewriteTextWithAiQuery = { __typename?: 'Query', rewriteTextWithAI: string };

export type RestructureJobDescriptionWithAiQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type RestructureJobDescriptionWithAiQuery = { __typename?: 'Query', restructureJobDescriptionWithAI: string };

export type GenerateJobLocationWithAiQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type GenerateJobLocationWithAiQuery = { __typename?: 'Query', generateJobLocationWithAI?: string | null };

export type GenerateJobWorkRegionWithAiQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type GenerateJobWorkRegionWithAiQuery = { __typename?: 'Query', generateJobWorkRegionWithAI?: string | null };

export type RequestJobSummaryMutationVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type RequestJobSummaryMutation = { __typename?: 'Mutation', requestJobSummary: { __typename?: 'JobType', id: string, summary?: string | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } };

export type FillJobAutomaticallyMutationVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type FillJobAutomaticallyMutation = { __typename?: 'Mutation', fillJobAutomatically: { __typename?: 'JobType', id: string, currentStage: ApplicationStage, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } };

export type CreateDraftCaptureJobMutationVariables = Exact<{
  input: CreateJobInput;
}>;


export type CreateDraftCaptureJobMutation = { __typename?: 'Mutation', createJob: { __typename?: 'JobType', id: string, title?: string | null, urls: Array<string>, htmlContent?: string | null, currentStage: ApplicationStage, createdAt: any, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } };

export type JobSummaryStatusChangedSubscriptionVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobSummaryStatusChangedSubscription = { __typename?: 'Subscription', jobSummaryStatusChanged: { __typename?: 'JobSummaryStatusEventType', jobId: string, status: string } };

export type JobFillStatusChangedSubscriptionVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobFillStatusChangedSubscription = { __typename?: 'Subscription', jobFillStatusChanged: { __typename?: 'JobFillStatusEventType', jobId: string, status: string, error?: string | null } };

export type JobMatchStatusChangedSubscriptionVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobMatchStatusChangedSubscription = { __typename?: 'Subscription', jobMatchStatusChanged: { __typename?: 'JobMatchStatusEventType', jobId: string, matchId: string, status: string } };

export type MatchAnalysesListQueryVariables = Exact<{ [key: string]: never; }>;


export type MatchAnalysesListQuery = { __typename?: 'Query', matchAnalyses: Array<{ __typename?: 'MatchAnalysisType', id: string, jobId: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, createdAt: any, updatedAt: any, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, job?: { __typename?: 'JobType', id: string, title?: string | null, company?: { __typename?: 'CompanyType', id: string, name: string } | null } | null }> };

export type MatchQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MatchQuery = { __typename?: 'Query', match: { __typename?: 'MatchAnalysisType', id: string, jobId: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, createdAt: any, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, items: Array<{ __typename?: 'MatchItemType', id: string, requirement: string, source: MatchSource, weight?: Weight | null, type: RequirementType, verdict: MatchVerdict, jdQuote: string, sourceQuotes: Array<string>, suggestion?: string | null }>, job?: { __typename?: 'JobType', id: string, title?: string | null, company?: { __typename?: 'CompanyType', id: string, name: string } | null } | null } };

export type JobMatchQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type JobMatchQuery = { __typename?: 'Query', jobMatch?: { __typename?: 'MatchAnalysisType', id: string, jobId: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, createdAt: any, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, items: Array<{ __typename?: 'MatchItemType', id: string, requirement: string, source: MatchSource, weight?: Weight | null, type: RequirementType, verdict: MatchVerdict, jdQuote: string, sourceQuotes: Array<string>, suggestion?: string | null }> } | null };

export type GenerateJobMatchMutationVariables = Exact<{
  input: GenerateMatchInput;
}>;


export type GenerateJobMatchMutation = { __typename?: 'Mutation', generateJobMatch: { __typename?: 'MatchAnalysisType', id: string, jobId: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, createdAt: any, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, items: Array<{ __typename?: 'MatchItemType', id: string, requirement: string, source: MatchSource, weight?: Weight | null, type: RequirementType, verdict: MatchVerdict, jdQuote: string, sourceQuotes: Array<string>, suggestion?: string | null }> } };

export type DeleteMatchAnalysisMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMatchAnalysisMutation = { __typename?: 'Mutation', deleteMatchAnalysis: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserType', id: string, email: string, name: string, role: string, avatarUrl?: string | null, accounts: Array<{ __typename?: 'AuthAccount', id: string, providerName: AuthProvider, providerAccountId: string, createdAt: any }> } };

export type ResumesQueryVariables = Exact<{ [key: string]: never; }>;


export type ResumesQuery = { __typename?: 'Query', resumes: Array<{ __typename?: 'ResumeType', id: string, title: string, content: string, isDefault: boolean, createdAt: any, updatedAt: any }> };

export type ResumesForPickerQueryVariables = Exact<{ [key: string]: never; }>;


export type ResumesForPickerQuery = { __typename?: 'Query', resumes: Array<{ __typename?: 'ResumeType', id: string, title: string, isDefault: boolean }> };

export type ResumeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResumeQuery = { __typename?: 'Query', resume: { __typename?: 'ResumeType', id: string, userId: string, title: string, content: string, isDefault: boolean, createdAt: any, updatedAt: any } };

export type CreateResumeMutationVariables = Exact<{
  input: CreateResumeInput;
}>;


export type CreateResumeMutation = { __typename?: 'Mutation', createResume: { __typename?: 'ResumeType', id: string, title: string, content: string, isDefault: boolean, createdAt: any, updatedAt: any } };

export type UpdateResumeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateResumeInput;
}>;


export type UpdateResumeMutation = { __typename?: 'Mutation', updateResume: { __typename?: 'ResumeType', id: string, title: string, content: string, isDefault: boolean, createdAt: any, updatedAt: any } };

export type DeleteResumeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteResumeMutation = { __typename?: 'Mutation', deleteResume: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type SettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsQuery = { __typename?: 'Query', settings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, duplicateWindowDays: number } };

export type UpdateSettingsMutationVariables = Exact<{
  input: UpdateSettingsInput;
}>;


export type UpdateSettingsMutation = { __typename?: 'Mutation', updateSettings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, duplicateWindowDays: number } };

export type SourceProfilesListQueryVariables = Exact<{ [key: string]: never; }>;


export type SourceProfilesListQuery = { __typename?: 'Query', sourceProfiles: Array<{ __typename?: 'SourceProfileType', sourceProfileId: string, name: string }> };

export type SourceProfilesListAllQueryVariables = Exact<{ [key: string]: never; }>;


export type SourceProfilesListAllQuery = { __typename?: 'Query', sourceProfiles: Array<{ __typename?: 'SourceProfileType', sourceProfileId: string, name: string }> };

export type RerunSourceTemplateMutationVariables = Exact<{
  templateId: Scalars['ID']['input'];
}>;


export type RerunSourceTemplateMutation = { __typename?: 'Mutation', rerunSourceTemplate: { __typename?: 'SourceRunType', id: string, status: SourceRunStatus, startedAt: any, surfaceUrl: string, sourceProfileId: string } };

export type DeleteSourceRunMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  deleteJobs?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteSourceRunMutation = { __typename?: 'Mutation', deleteSourceRun: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type SourceTemplateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SourceTemplateQuery = { __typename?: 'Query', sourceTemplate: { __typename?: 'SourceTemplateType', id: string, sourceProfileId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, startedAt: any }> } };

export type SourcesForSourceProfileQueryVariables = Exact<{
  sourceProfileId: Scalars['String']['input'];
}>;


export type SourcesForSourceProfileQuery = { __typename?: 'Query', sourceTemplatesForSourceProfile: Array<{ __typename?: 'SourceTemplateType', id: string, sourceProfileId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, startedAt: any }> }> };

export type UpdateSourceTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSourceTemplateInput;
}>;


export type UpdateSourceTemplateMutation = { __typename?: 'Mutation', updateSourceTemplate: { __typename?: 'SourceTemplateType', id: string, sourceProfileId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, startedAt: any }> } };

export type DeleteSourceTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSourceTemplateMutation = { __typename?: 'Mutation', deleteSourceTemplate: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type CreateSourceTemplateMutationVariables = Exact<{
  input: CreateSourceTemplateInput;
}>;


export type CreateSourceTemplateMutation = { __typename?: 'Mutation', createSourceTemplate: { __typename?: 'SourceTemplateType', id: string, sourceProfileId: string, surfaceUrl: string, scheduleCron?: string | null, scheduleEnabled: boolean, createdAt: any } };

export type WorkPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkPreferencesQuery = { __typename?: 'Query', workPreferences: Array<{ __typename?: 'PreferenceType', text: string, weight: Weight }> };

export type UpdateWorkPreferencesMutationVariables = Exact<{
  items: Array<PreferenceInput> | PreferenceInput;
}>;


export type UpdateWorkPreferencesMutation = { __typename?: 'Mutation', updateWorkPreferences: Array<{ __typename?: 'PreferenceType', text: string, weight: Weight }> };

export const JobSalarySelectionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobSalarySelection"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minCents"}},{"kind":"Field","name":{"kind":"Name","value":"maxCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<JobSalarySelectionFragment, unknown>;
export const AdminSourceRunsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSourceRunsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceRuns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfile"}}]}}]}}]} as unknown as DocumentNode<AdminSourceRunsListQuery, AdminSourceRunsListQueryVariables>;
export const AdminExtensionActivityEventsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminExtensionActivityEventsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionActivityEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"correlationId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]} as unknown as DocumentNode<AdminExtensionActivityEventsListQuery, AdminExtensionActivityEventsListQueryVariables>;
export const AdminSourceRunEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"AdminSourceRunEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceRunEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}},{"kind":"Field","name":{"kind":"Name","value":"run"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfile"}}]}}]}}]}}]} as unknown as DocumentNode<AdminSourceRunEventsSubscription, AdminSourceRunEventsSubscriptionVariables>;
export const AdminExtensionActivityEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"AdminExtensionActivityEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensionActivityEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"correlationId"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]} as unknown as DocumentNode<AdminExtensionActivityEventsSubscription, AdminExtensionActivityEventsSubscriptionVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AuthenticatedShellDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthenticatedShell"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"providerAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"autoFillEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoSummaryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoMatchEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"duplicateWindowDays"}}]}}]}}]} as unknown as DocumentNode<AuthenticatedShellQuery, AuthenticatedShellQueryVariables>;
export const UpdateCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCompanyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpdateCompanyMutation, UpdateCompanyMutationVariables>;
export const DeleteCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteCompanyMutation, DeleteCompanyMutationVariables>;
export const CompanyJobsCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CompanyJobsCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"companyJobsCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<CompanyJobsCountQuery, CompanyJobsCountQueryVariables>;
export const CompaniesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Companies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"companies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<CompaniesQuery, CompaniesQueryVariables>;
export const CompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Company"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"company"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<CompanyQuery, CompanyQueryVariables>;
export const ExchangeRatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExchangeRates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"base"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currencies"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exchangeRates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"base"},"value":{"kind":"Variable","name":{"kind":"Name","value":"base"}}},{"kind":"Argument","name":{"kind":"Name","value":"currencies"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currencies"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"base"}},{"kind":"Field","name":{"kind":"Name","value":"rates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"rate"}}]}}]}}]}}]} as unknown as DocumentNode<ExchangeRatesQuery, ExchangeRatesQueryVariables>;
export const JobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Jobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationQuickFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"company"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"runId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"company"},"value":{"kind":"Variable","name":{"kind":"Name","value":"company"}}},{"kind":"Argument","name":{"kind":"Name","value":"runId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"runId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"urls"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"JobSalarySelection"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"workRegion"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRunId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fillMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentStage"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageReason"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"match"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobSalarySelection"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minCents"}},{"kind":"Field","name":{"kind":"Name","value":"maxCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<JobsQuery, JobsQueryVariables>;
export const JobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Job"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"urls"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"JobSalarySelection"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"workRegion"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRunId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fillMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"htmlContent"}},{"kind":"Field","name":{"kind":"Name","value":"currentStage"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageReason"}},{"kind":"Field","name":{"kind":"Name","value":"currentStageAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"match"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobSalarySelection"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minCents"}},{"kind":"Field","name":{"kind":"Name","value":"maxCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<JobQuery, JobQueryVariables>;
export const CreateJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"urls"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"JobSalarySelection"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"workRegion"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobSalarySelection"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minCents"}},{"kind":"Field","name":{"kind":"Name","value":"maxCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<CreateJobMutation, CreateJobMutationVariables>;
export const GenerateCompanyDescriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateCompanyDescription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateCompanyDescription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"companyName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyName"}}}]}]}}]} as unknown as DocumentNode<GenerateCompanyDescriptionQuery, GenerateCompanyDescriptionQueryVariables>;
export const UpdateJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateJobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"urls"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"JobSalarySelection"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"workRegion"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobSalarySelection"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"JobType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minCents"}},{"kind":"Field","name":{"kind":"Name","value":"maxCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]} as unknown as DocumentNode<UpdateJobMutation, UpdateJobMutationVariables>;
export const RemoveJobTagDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveJobTag"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tag"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeJobTag"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"tag"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tag"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}}]}}]} as unknown as DocumentNode<RemoveJobTagMutation, RemoveJobTagMutationVariables>;
export const DeleteJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteJobMutation, DeleteJobMutationVariables>;
export const JobStageEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobStageEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobStageEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStage"}},{"kind":"Field","name":{"kind":"Name","value":"toStage"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<JobStageEventsQuery, JobStageEventsQueryVariables>;
export const CreateJobStageEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJobStageEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJobStageEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJobStageEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStage"}},{"kind":"Field","name":{"kind":"Name","value":"toStage"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateJobStageEventMutation, CreateJobStageEventMutationVariables>;
export const UpdateJobStageEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateJobStageEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateJobStageEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJobStageEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"fromStage"}},{"kind":"Field","name":{"kind":"Name","value":"toStage"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateJobStageEventMutation, UpdateJobStageEventMutationVariables>;
export const DeleteJobStageEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteJobStageEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteJobStageEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteJobStageEventMutation, DeleteJobStageEventMutationVariables>;
export const JobNotesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobNotes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobNotes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<JobNotesQuery, JobNotesQueryVariables>;
export const CreateJobNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJobNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJobNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateJobNoteMutation, CreateJobNoteMutationVariables>;
export const UpdateJobNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateJobNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateJobNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateJobNoteMutation, UpdateJobNoteMutationVariables>;
export const DeleteJobNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteJobNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteJobNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteJobNoteMutation, DeleteJobNoteMutationVariables>;
export const GenerateJobNoteWithAiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateJobNoteWithAi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateJobNoteWithAI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}]}]}}]} as unknown as DocumentNode<GenerateJobNoteWithAiQuery, GenerateJobNoteWithAiQueryVariables>;
export const RewriteTextWithAiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RewriteTextWithAi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rewriteTextWithAI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}]}]}}]} as unknown as DocumentNode<RewriteTextWithAiQuery, RewriteTextWithAiQueryVariables>;
export const RestructureJobDescriptionWithAiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RestructureJobDescriptionWithAi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restructureJobDescriptionWithAI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}]}]}}]} as unknown as DocumentNode<RestructureJobDescriptionWithAiQuery, RestructureJobDescriptionWithAiQueryVariables>;
export const GenerateJobLocationWithAiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateJobLocationWithAi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateJobLocationWithAI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}]}]}}]} as unknown as DocumentNode<GenerateJobLocationWithAiQuery, GenerateJobLocationWithAiQueryVariables>;
export const GenerateJobWorkRegionWithAiDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateJobWorkRegionWithAi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateJobWorkRegionWithAI"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}]}]}}]} as unknown as DocumentNode<GenerateJobWorkRegionWithAiQuery, GenerateJobWorkRegionWithAiQueryVariables>;
export const RequestJobSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestJobSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestJobSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"summaryMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]} as unknown as DocumentNode<RequestJobSummaryMutation, RequestJobSummaryMutationVariables>;
export const FillJobAutomaticallyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FillJobAutomatically"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fillJobAutomatically"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fillMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentStage"}}]}}]}}]} as unknown as DocumentNode<FillJobAutomaticallyMutation, FillJobAutomaticallyMutationVariables>;
export const CreateDraftCaptureJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDraftCaptureJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"urls"}},{"kind":"Field","name":{"kind":"Name","value":"htmlContent"}},{"kind":"Field","name":{"kind":"Name","value":"currentStage"}},{"kind":"Field","name":{"kind":"Name","value":"fillMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateDraftCaptureJobMutation, CreateDraftCaptureJobMutationVariables>;
export const JobSummaryStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"JobSummaryStatusChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobSummaryStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<JobSummaryStatusChangedSubscription, JobSummaryStatusChangedSubscriptionVariables>;
export const JobFillStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"JobFillStatusChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobFillStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<JobFillStatusChangedSubscription, JobFillStatusChangedSubscriptionVariables>;
export const JobMatchStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"JobMatchStatusChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobMatchStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"matchId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<JobMatchStatusChangedSubscription, JobMatchStatusChangedSubscriptionVariables>;
export const MatchAnalysesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MatchAnalysesList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"matchAnalyses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"job"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MatchAnalysesListQuery, MatchAnalysesListQueryVariables>;
export const MatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Match"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"match"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requirement"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"verdict"}},{"kind":"Field","name":{"kind":"Name","value":"jdQuote"}},{"kind":"Field","name":{"kind":"Name","value":"sourceQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"job"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MatchQuery, MatchQueryVariables>;
export const JobMatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"JobMatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobMatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"jobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requirement"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"verdict"}},{"kind":"Field","name":{"kind":"Name","value":"jdQuote"}},{"kind":"Field","name":{"kind":"Name","value":"sourceQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<JobMatchQuery, JobMatchQueryVariables>;
export const GenerateJobMatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateJobMatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenerateMatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateJobMatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"jobId"}},{"kind":"Field","name":{"kind":"Name","value":"resumeId"}},{"kind":"Field","name":{"kind":"Name","value":"generationMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoreRatio"}},{"kind":"Field","name":{"kind":"Name","value":"classification"}},{"kind":"Field","name":{"kind":"Name","value":"matchCount"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"unclearCount"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requirement"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"verdict"}},{"kind":"Field","name":{"kind":"Name","value":"jdQuote"}},{"kind":"Field","name":{"kind":"Name","value":"sourceQuotes"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GenerateJobMatchMutation, GenerateJobMatchMutationVariables>;
export const DeleteMatchAnalysisDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMatchAnalysis"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMatchAnalysis"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteMatchAnalysisMutation, DeleteMatchAnalysisMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"providerName"}},{"kind":"Field","name":{"kind":"Name","value":"providerAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const ResumesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Resumes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ResumesQuery, ResumesQueryVariables>;
export const ResumesForPickerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ResumesForPicker"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]}}]} as unknown as DocumentNode<ResumesForPickerQuery, ResumesForPickerQueryVariables>;
export const ResumeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Resume"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resume"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ResumeQuery, ResumeQueryVariables>;
export const CreateResumeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateResume"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateResumeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createResume"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateResumeMutation, CreateResumeMutationVariables>;
export const UpdateResumeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateResume"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateResumeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateResume"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateResumeMutation, UpdateResumeMutationVariables>;
export const DeleteResumeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteResume"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteResume"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteResumeMutation, DeleteResumeMutationVariables>;
export const SettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"autoFillEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoSummaryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoMatchEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"duplicateWindowDays"}}]}}]}}]} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const UpdateSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"autoFillEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoSummaryEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"autoMatchEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"duplicateWindowDays"}}]}}]}}]} as unknown as DocumentNode<UpdateSettingsMutation, UpdateSettingsMutationVariables>;
export const SourceProfilesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceProfilesList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceProfiles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"onlyWithSourceTemplate"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SourceProfilesListQuery, SourceProfilesListQueryVariables>;
export const SourceProfilesListAllDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceProfilesListAll"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceProfiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<SourceProfilesListAllQuery, SourceProfilesListAllQueryVariables>;
export const RerunSourceTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RerunSourceTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"templateId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rerunSourceTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"templateId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"templateId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}}]}}]}}]} as unknown as DocumentNode<RerunSourceTemplateMutation, RerunSourceTemplateMutationVariables>;
export const DeleteSourceRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSourceRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deleteJobs"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSourceRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"deleteJobs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deleteJobs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteSourceRunMutation, DeleteSourceRunMutationVariables>;
export const SourceTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourceTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleCron"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"runs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}}]}}]}}]}}]} as unknown as DocumentNode<SourceTemplateQuery, SourceTemplateQueryVariables>;
export const SourcesForSourceProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SourcesForSourceProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sourceProfileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sourceTemplatesForSourceProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sourceProfileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sourceProfileId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleCron"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"runs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}}]}}]}}]}}]} as unknown as DocumentNode<SourcesForSourceProfileQuery, SourcesForSourceProfileQueryVariables>;
export const UpdateSourceTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSourceTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSourceTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSourceTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleCron"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"runs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateSourceTemplateMutation, UpdateSourceTemplateMutationVariables>;
export const DeleteSourceTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSourceTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSourceTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"deletedId"}}]}}]}}]} as unknown as DocumentNode<DeleteSourceTemplateMutation, DeleteSourceTemplateMutationVariables>;
export const CreateSourceTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSourceTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSourceTemplateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSourceTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sourceProfileId"}},{"kind":"Field","name":{"kind":"Name","value":"surfaceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleCron"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateSourceTemplateMutation, CreateSourceTemplateMutationVariables>;
export const WorkPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]}}]} as unknown as DocumentNode<WorkPreferencesQuery, WorkPreferencesQueryVariables>;
export const UpdateWorkPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PreferenceInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkPreferencesMutation, UpdateWorkPreferencesMutationVariables>;