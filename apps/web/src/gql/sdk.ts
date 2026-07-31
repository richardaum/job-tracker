import type { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
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

export type AiConversationType = {
  __typename?: 'AiConversationType';
  createdAt: Scalars['DateTime']['output'];
  generatingStatus?: Maybe<AsyncMetadataType>;
  id: Scalars['ID']['output'];
  jobId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum AiMessageRole {
  Assistant = 'Assistant',
  User = 'User'
}

export type AiMessageStreamEventType = {
  __typename?: 'AiMessageStreamEventType';
  aiMessageId?: Maybe<Scalars['ID']['output']>;
  conversationId: Scalars['ID']['output'];
  error?: Maybe<Scalars['String']['output']>;
  phase: AiMessageStreamPhase;
  token?: Maybe<Scalars['String']['output']>;
  userMessageId?: Maybe<Scalars['ID']['output']>;
};

export enum AiMessageStreamPhase {
  Complete = 'Complete',
  Failed = 'Failed',
  Ready = 'Ready',
  Streaming = 'Streaming'
}

export type AiMessageType = {
  __typename?: 'AiMessageType';
  content: Scalars['String']['output'];
  conversationId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: AiMessageRole;
};

export type AiUsageChangedEventType = {
  __typename?: 'AiUsageChangedEventType';
  hasOpenAiKey: Scalars['Boolean']['output'];
  trialCallsUsed: Scalars['Int']['output'];
};

export enum ApplicationQuickFilter {
  Active = 'Active',
  Applied = 'Applied',
  Draft = 'Draft',
  Duplicated = 'Duplicated',
  Incoming = 'Incoming',
  New = 'New',
  Rejected = 'Rejected'
}

export enum ApplicationStage {
  Applied = 'Applied',
  CulturalFit = 'CulturalFit',
  Draft = 'Draft',
  Duplicated = 'Duplicated',
  New = 'New',
  Offer = 'Offer',
  RecruiterScreen = 'RecruiterScreen',
  Rejected = 'Rejected',
  Technical = 'Technical'
}

export type AskQuestionPayloadType = {
  __typename?: 'AskQuestionPayloadType';
  success: Scalars['Boolean']['output'];
};

export enum AsyncMetadataStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  Processing = 'Processing'
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
  Google = 'Google'
}

export type BlockedKeyword = {
  __typename?: 'BlockedKeyword';
  keyword: Scalars['String']['output'];
  matchMode: MatchMode;
  scope: KeywordScope;
};

export type BlockedKeywordInput = {
  keyword: Scalars['String']['input'];
  matchMode: MatchMode;
  scope: KeywordScope;
};

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
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
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

export type CreatePlanInput = {
  displayName: Scalars['String']['input'];
  document: Scalars['JSON']['input'];
};

export type CreateResumeInput = {
  content: Scalars['String']['input'];
  isDefault?: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
};

export type CreateSourceRunInput = {
  planId: Scalars['ID']['input'];
};

export type CreateSourceTemplateInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  planId: Scalars['ID']['input'];
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
  /** Extension version that reported the event. */
  extensionVersion?: Maybe<Scalars['String']['output']>;
  /** Unique event identifier. */
  id: Scalars['ID']['output'];
  /** When the event actually happened (client-reported). */
  occurredAt: Scalars['DateTime']['output'];
  /** Arbitrary JSON payload with event details. */
  payload?: Maybe<Scalars['JSON']['output']>;
  /** Groups related events (e.g. run ID). */
  sourceRunId?: Maybe<Scalars['String']['output']>;
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
  SourceRunJobDetailsImport = 'SourceRunJobDetailsImport',
  SourceRunJobSkipped = 'SourceRunJobSkipped',
  SourceRunJobSurfaceImport = 'SourceRunJobSurfaceImport',
  SourceRunPageCollected = 'SourceRunPageCollected',
  SourceRunReceived = 'SourceRunReceived',
  SourceRunStarted = 'SourceRunStarted',
  SourceRunStopConditionMet = 'SourceRunStopConditionMet'
}

export type FilterCountType = {
  __typename?: 'FilterCountType';
  count: Scalars['Int']['output'];
  key: ApplicationQuickFilter;
};

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
  Jack = 'Jack',
  Linkedin = 'Linkedin',
  RemoteYeah = 'RemoteYeah',
  Wellfound = 'Wellfound'
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
  summary?: Maybe<Scalars['String']['output']>;
  summaryMetadata?: Maybe<AsyncMetadataType>;
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
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
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

export enum KeywordScope {
  Company = 'Company',
  Description = 'Description',
  Title = 'Title'
}

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

export enum MatchMode {
  Exact = 'Exact',
  Partial = 'Partial'
}

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
  askAiQuestion: AskQuestionPayloadType;
  clearSourceRuns: Scalars['Boolean']['output'];
  clearSourceTemplateRuns: Scalars['Int']['output'];
  createAiConversation: AiConversationType;
  createJob: JobType;
  createJobNote: NoteType;
  createJobStageEvent: JobStageEventType;
  createPlan: PlanType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deactivateAccount: Scalars['Boolean']['output'];
  deleteAiConversation: DeleteMutationPayloadType;
  deleteCompany: DeleteMutationPayloadType;
  deleteJob: DeleteMutationPayloadType;
  deleteJobNote: DeleteMutationPayloadType;
  deleteJobStageEvent: DeleteMutationPayloadType;
  deleteMatchAnalysis: DeleteMutationPayloadType;
  deletePlan: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachJobsFromSourceRun: Scalars['Int']['output'];
  fillJobAutomatically: JobType;
  generateJobMatch: MatchAnalysisType;
  removeJobTag: JobType;
  removeOpenAiKey: UserSetting;
  reportExtensionActivity: ExtensionActivityEvent;
  requestJobSummary: JobType;
  rerunSourceTemplate: SourceRunType;
  saveOpenAiKey: UserSetting;
  setUserTrialCallsLimit: UserSetting;
  updateCompany: CompanyType;
  updateJob: JobType;
  updateJobNote: NoteType;
  updateJobStageEvent: JobStageEventType;
  updatePlan: PlanType;
  updateResume: ResumeType;
  updateSettings: UserSetting;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateSourceTemplate: SourceTemplateType;
  updateWorkPreferences: Array<PreferenceType>;
};


export type MutationAskAiQuestionArgs = {
  content: Scalars['String']['input'];
  conversationId: Scalars['ID']['input'];
};


export type MutationClearSourceTemplateRunsArgs = {
  deleteJobs?: InputMaybe<Scalars['Boolean']['input']>;
  templateId: Scalars['ID']['input'];
};


export type MutationCreateAiConversationArgs = {
  jobId: Scalars['ID']['input'];
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


export type MutationCreatePlanArgs = {
  input: CreatePlanInput;
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


export type MutationDeleteAiConversationArgs = {
  id: Scalars['ID']['input'];
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


export type MutationDeletePlanArgs = {
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


export type MutationSaveOpenAiKeyArgs = {
  key: Scalars['String']['input'];
};


export type MutationSetUserTrialCallsLimitArgs = {
  limit: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
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


export type MutationUpdatePlanArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePlanInput;
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
  errorMessage?: InputMaybe<Scalars['String']['input']>;
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

export type PlanType = {
  __typename?: 'PlanType';
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  document: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  templates: Array<SourceTemplateType>;
  updatedAt: Scalars['DateTime']['output'];
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
  aiConversations: Array<AiConversationType>;
  aiMessages: Array<AiMessageType>;
  companies: Array<CompanyType>;
  company: CompanyType;
  companyJobsCount: Scalars['Int']['output'];
  exchangeRates: CurrencyRates;
  extensionActivityEvents: Array<ExtensionActivityEvent>;
  generateCompanyDescription: Scalars['String']['output'];
  generateJobLocationWithAI?: Maybe<Scalars['String']['output']>;
  generateJobNoteWithAI: Scalars['String']['output'];
  generateJobWorkRegionWithAI?: Maybe<Scalars['String']['output']>;
  isJobDuplicate: Scalars['Boolean']['output'];
  job: JobType;
  jobMatch?: Maybe<MatchAnalysisType>;
  jobNotes: Array<NoteType>;
  jobStageEvents: Array<JobStageEventType>;
  jobs: Array<JobType>;
  match: MatchAnalysisType;
  matchAnalyses: Array<MatchAnalysisType>;
  me: UserType;
  plan?: Maybe<PlanType>;
  plans: Array<PlanType>;
  quickFilterCounts: Array<FilterCountType>;
  restructureJobDescriptionWithAI: Scalars['String']['output'];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars['String']['output'];
  settings: UserSetting;
  sourceRunActivityEvents: Array<SourceRunActivityEvent>;
  sourceRuns: Array<SourceRunType>;
  sourceTemplate: SourceTemplateType;
  sourceTemplates: Array<SourceTemplateType>;
  users: Array<UserType>;
  workPreferences: Array<PreferenceType>;
};


export type QueryAiConversationsArgs = {
  jobId: Scalars['ID']['input'];
};


export type QueryAiMessagesArgs = {
  conversationId: Scalars['ID']['input'];
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


export type QueryIsJobDuplicateArgs = {
  company: Scalars['String']['input'];
  title: Scalars['String']['input'];
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


export type QueryPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuickFilterCountsArgs = {
  company?: InputMaybe<Scalars['String']['input']>;
  runId?: InputMaybe<Scalars['ID']['input']>;
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


export type QuerySourceRunActivityEventsArgs = {
  runId: Scalars['ID']['input'];
};


export type QuerySourceTemplateArgs = {
  id: Scalars['ID']['input'];
};

export type ReportExtensionActivityInput = {
  browser?: InputMaybe<Scalars['String']['input']>;
  extensionVersion?: InputMaybe<Scalars['String']['input']>;
  occurredAt?: InputMaybe<Scalars['DateTime']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  sourceRunId?: InputMaybe<Scalars['String']['input']>;
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

export enum Role {
  Admin = 'Admin',
  User = 'User'
}

export enum SalaryPeriod {
  Hour = 'Hour',
  Month = 'Month',
  Year = 'Year'
}

export type SourceRunActivityEvent = {
  __typename?: 'SourceRunActivityEvent';
  occurredAt: Scalars['DateTime']['output'];
  payload?: Maybe<Scalars['JSON']['output']>;
  summary: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SourceRunEvent = {
  __typename?: 'SourceRunEvent';
  occurredAt: Scalars['DateTime']['output'];
  run: SourceRunType;
  type: SourceRunEventType;
};

export enum SourceRunEventType {
  SourceRunCreated = 'SourceRunCreated',
  SourceRunStatusChanged = 'SourceRunStatusChanged'
}

export enum SourceRunStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  Pending = 'Pending'
}

export type SourceRunType = {
  __typename?: 'SourceRunType';
  catchUpThreshold?: Maybe<Scalars['Int']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobCount: Scalars['Int']['output'];
  maxPages?: Maybe<Scalars['Int']['output']>;
  olderThanDays?: Maybe<Scalars['Int']['output']>;
  planId: Scalars['ID']['output'];
  startedAt: Scalars['DateTime']['output'];
  status: SourceRunStatus;
  stopWhen?: Maybe<StopWhen>;
  surfaceUrl: Scalars['String']['output'];
  templateId: Scalars['ID']['output'];
};

export type SourceTemplateType = {
  __typename?: 'SourceTemplateType';
  config?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  plan: PlanType;
  planId: Scalars['ID']['output'];
  runs: Array<SourceRunType>;
  scheduleCron?: Maybe<Scalars['String']['output']>;
  scheduleEnabled: Scalars['Boolean']['output'];
  surfaceUrl: Scalars['String']['output'];
};

export enum StageEventSource {
  Manual = 'Manual',
  System = 'System'
}

export enum StopWhen {
  CatchUp = 'CatchUp',
  FirstRunMaxPages = 'FirstRunMaxPages',
  OlderThan = 'OlderThan'
}

export type Subscription = {
  __typename?: 'Subscription';
  aiMessageStreamed: AiMessageStreamEventType;
  aiUsageChanged: AiUsageChangedEventType;
  extensionActivityEvents: ExtensionActivityEvent;
  jobFillStatusChanged: JobFillStatusEventType;
  jobMatchStatusChanged: JobMatchStatusEventType;
  jobSummaryStatusChanged: JobSummaryStatusEventType;
  sourceRunEvents: SourceRunEvent;
};


export type SubscriptionAiMessageStreamedArgs = {
  conversationId: Scalars['ID']['input'];
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

export type UpdatePlanInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  document?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateResumeInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSettingsInput = {
  aiEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  autoFillEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  autoMatchEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  autoSummaryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  blockedCompanies?: InputMaybe<Array<Scalars['String']['input']>>;
  blockedKeywords?: InputMaybe<Array<BlockedKeywordInput>>;
  duplicateWindowDays?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSourceRunInput = {
  surfaceUrl: Scalars['String']['input'];
};

export type UpdateSourceTemplateInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  scheduleCron?: InputMaybe<Scalars['String']['input']>;
  scheduleEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  surfaceUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UserSetting = {
  __typename?: 'UserSetting';
  aiEnabled: Scalars['Boolean']['output'];
  autoFillEnabled: Scalars['Boolean']['output'];
  autoMatchEnabled: Scalars['Boolean']['output'];
  autoSummaryEnabled: Scalars['Boolean']['output'];
  blockedCompanies?: Maybe<Array<Scalars['String']['output']>>;
  blockedKeywords?: Maybe<Array<BlockedKeyword>>;
  duplicateWindowDays: Scalars['Int']['output'];
  hasOpenAiKey: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  trialCallsLimit: Scalars['Int']['output'];
  trialCallsUsed: Scalars['Int']['output'];
  userId: Scalars['String']['output'];
};

export type UserType = {
  __typename?: 'UserType';
  accounts: Array<AuthAccount>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Role;
};

export enum Weight {
  High = 'High',
  Low = 'Low'
}

export type AdminSourceRunsListQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSourceRunsListQuery = { __typename?: 'Query', sourceRuns: Array<{ __typename?: 'SourceRunType', id: string, templateId: string, planId: string, surfaceUrl: string, status: SourceRunStatus, startedAt: any }> };

export type AdminSourceRunEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AdminSourceRunEventsSubscription = { __typename?: 'Subscription', sourceRunEvents: { __typename?: 'SourceRunEvent', type: SourceRunEventType, occurredAt: any, run: { __typename?: 'SourceRunType', id: string, templateId: string, planId: string, surfaceUrl: string, status: SourceRunStatus, startedAt: any } } };

export type AdminExtensionActivityEventsListQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminExtensionActivityEventsListQuery = { __typename?: 'Query', extensionActivityEvents: Array<{ __typename?: 'ExtensionActivityEvent', id: string, type: ExtensionActivityEventType, summary: string, sourceRunId?: string | null, occurredAt: any }> };

export type AdminExtensionActivityEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AdminExtensionActivityEventsSubscription = { __typename?: 'Subscription', extensionActivityEvents: { __typename?: 'ExtensionActivityEvent', id: string, type: ExtensionActivityEventType, summary: string, sourceRunId?: string | null, occurredAt: any } };

export type AdminUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'UserType', id: string, email: string, name: string, role: Role, avatarUrl?: string | null }> };

export type AiConversationFieldsFragment = { __typename?: 'AiConversationType', id: string, jobId: string, title: string, createdAt: any, updatedAt: any };

export type AiMessageFieldsFragment = { __typename?: 'AiMessageType', id: string, conversationId: string, role: AiMessageRole, content: string, createdAt: any };

export type AiMessageStreamEventFieldsFragment = { __typename?: 'AiMessageStreamEventType', conversationId: string, phase: AiMessageStreamPhase, token?: string | null, userMessageId?: string | null, aiMessageId?: string | null, error?: string | null };

export type AiConversationsQueryVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type AiConversationsQuery = { __typename?: 'Query', aiConversations: Array<{ __typename?: 'AiConversationType', id: string, jobId: string, title: string, createdAt: any, updatedAt: any }> };

export type AiMessagesQueryVariables = Exact<{
  conversationId: Scalars['ID']['input'];
}>;


export type AiMessagesQuery = { __typename?: 'Query', aiMessages: Array<{ __typename?: 'AiMessageType', id: string, conversationId: string, role: AiMessageRole, content: string, createdAt: any }> };

export type CreateAiConversationMutationVariables = Exact<{
  jobId: Scalars['ID']['input'];
}>;


export type CreateAiConversationMutation = { __typename?: 'Mutation', createAiConversation: { __typename?: 'AiConversationType', id: string, jobId: string, title: string, createdAt: any, updatedAt: any } };

export type DeleteAiConversationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAiConversationMutation = { __typename?: 'Mutation', deleteAiConversation: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type AskAiQuestionMutationVariables = Exact<{
  conversationId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type AskAiQuestionMutation = { __typename?: 'Mutation', askAiQuestion: { __typename?: 'AskQuestionPayloadType', success: boolean } };

export type AiMessageStreamedSubscriptionVariables = Exact<{
  conversationId: Scalars['ID']['input'];
}>;


export type AiMessageStreamedSubscription = { __typename?: 'Subscription', aiMessageStreamed: { __typename?: 'AiMessageStreamEventType', conversationId: string, phase: AiMessageStreamPhase, token?: string | null, userMessageId?: string | null, aiMessageId?: string | null, error?: string | null } };

export type AuthenticatedShellQueryVariables = Exact<{ [key: string]: never; }>;


export type AuthenticatedShellQuery = { __typename?: 'Query', me: { __typename?: 'UserType', id: string, email: string, name: string, role: Role, avatarUrl?: string | null, accounts: Array<{ __typename?: 'AuthAccount', id: string, providerName: AuthProvider, providerAccountId: string, createdAt: any }> }, settings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, duplicateWindowDays: number } };

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

export type JobSalarySelectionFragment = { __typename?: 'JobType', salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null };

export type JobsQueryVariables = Exact<{
  filter?: InputMaybe<ApplicationQuickFilter>;
  company?: InputMaybe<Scalars['String']['input']>;
  runId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type JobsQuery = { __typename?: 'Query', jobs: Array<{ __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, sourceRunId?: string | null, summary?: string | null, currentStage: ApplicationStage, currentStageReason?: string | null, currentStageAt: any, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, match?: { __typename?: 'MatchAnalysisType', id: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } | null, salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null }> };

export type JobQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type JobQuery = { __typename?: 'Query', job: { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, sourceRunId?: string | null, summary?: string | null, htmlContent?: string | null, currentStage: ApplicationStage, currentStageReason?: string | null, currentStageAt: any, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, fillMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, match?: { __typename?: 'MatchAnalysisType', id: string, resumeId: string, scoreRatio?: number | null, classification?: FitClassification | null, matchCount: number, gapCount: number, unclearCount: number, generationMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } | null, salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null } };

export type CreateJobMutationVariables = Exact<{
  input: CreateJobInput;
}>;


export type CreateJobMutation = { __typename?: 'Mutation', createJob: { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null } };

export type GenerateCompanyDescriptionQueryVariables = Exact<{
  companyName: Scalars['String']['input'];
}>;


export type GenerateCompanyDescriptionQuery = { __typename?: 'Query', generateCompanyDescription: string };

export type UpdateJobMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateJobInput;
}>;


export type UpdateJobMutation = { __typename?: 'Mutation', updateJob: { __typename?: 'JobType', id: string, title?: string | null, companyId?: string | null, description?: string | null, urls: Array<string>, source?: JobSource | null, tags: Array<string>, location?: string | null, workRegion?: string | null, summary?: string | null, createdAt: any, company?: { __typename?: 'CompanyType', id: string, name: string, description?: string | null } | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null, salary?: { __typename?: 'JobSalary', minCents?: number | null, maxCents?: number | null, currency?: string | null, period?: SalaryPeriod | null } | null } };

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


export type JobSummaryStatusChangedSubscription = { __typename?: 'Subscription', jobSummaryStatusChanged: { __typename?: 'JobSummaryStatusEventType', jobId: string, status: string, summary?: string | null, summaryMetadata?: { __typename?: 'AsyncMetadataType', status?: AsyncMetadataStatus | null, error?: string | null, timestamp?: any | null } | null } };

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


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'UserType', id: string, email: string, name: string, role: Role, avatarUrl?: string | null, accounts: Array<{ __typename?: 'AuthAccount', id: string, providerName: AuthProvider, providerAccountId: string, createdAt: any }> } };

export type QuickFilterCountsQueryVariables = Exact<{
  company?: InputMaybe<Scalars['String']['input']>;
  runId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type QuickFilterCountsQuery = { __typename?: 'Query', quickFilterCounts: Array<{ __typename?: 'FilterCountType', key: ApplicationQuickFilter, count: number }> };

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


export type SettingsQuery = { __typename?: 'Query', settings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, aiEnabled: boolean, hasOpenAiKey: boolean, duplicateWindowDays: number, trialCallsUsed: number, trialCallsLimit: number, blockedCompanies?: Array<string> | null, blockedKeywords?: Array<{ __typename?: 'BlockedKeyword', keyword: string, scope: KeywordScope, matchMode: MatchMode }> | null } };

export type UpdateSettingsMutationVariables = Exact<{
  input: UpdateSettingsInput;
}>;


export type UpdateSettingsMutation = { __typename?: 'Mutation', updateSettings: { __typename?: 'UserSetting', id: string, autoFillEnabled: boolean, autoSummaryEnabled: boolean, autoMatchEnabled: boolean, aiEnabled: boolean, hasOpenAiKey: boolean, duplicateWindowDays: number, trialCallsUsed: number, trialCallsLimit: number, blockedCompanies?: Array<string> | null, blockedKeywords?: Array<{ __typename?: 'BlockedKeyword', keyword: string, scope: KeywordScope, matchMode: MatchMode }> | null } };

export type SaveOpenAiKeyMutationVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type SaveOpenAiKeyMutation = { __typename?: 'Mutation', saveOpenAiKey: { __typename?: 'UserSetting', id: string, aiEnabled: boolean, hasOpenAiKey: boolean, trialCallsUsed: number, trialCallsLimit: number } };

export type RemoveOpenAiKeyMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveOpenAiKeyMutation = { __typename?: 'Mutation', removeOpenAiKey: { __typename?: 'UserSetting', id: string, aiEnabled: boolean, hasOpenAiKey: boolean, trialCallsUsed: number, trialCallsLimit: number } };

export type AiUsageChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AiUsageChangedSubscription = { __typename?: 'Subscription', aiUsageChanged: { __typename?: 'AiUsageChangedEventType', trialCallsUsed: number, hasOpenAiKey: boolean } };

export type RerunSourceTemplateMutationVariables = Exact<{
  templateId: Scalars['ID']['input'];
}>;


export type RerunSourceTemplateMutation = { __typename?: 'Mutation', rerunSourceTemplate: { __typename?: 'SourceRunType', id: string, status: SourceRunStatus, startedAt: any, surfaceUrl: string, planId: string } };

export type SourceRunEventsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SourceRunEventsSubscription = { __typename?: 'Subscription', sourceRunEvents: { __typename?: 'SourceRunEvent', type: SourceRunEventType, occurredAt: any, run: { __typename?: 'SourceRunType', id: string, templateId: string, status: SourceRunStatus, errorMessage?: string | null } } };

export type ClearSourceTemplateRunsMutationVariables = Exact<{
  templateId: Scalars['ID']['input'];
  deleteJobs?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ClearSourceTemplateRunsMutation = { __typename?: 'Mutation', clearSourceTemplateRuns: number };

export type DeleteSourceRunMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  deleteJobs?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteSourceRunMutation = { __typename?: 'Mutation', deleteSourceRun: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type SourceTemplateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SourceTemplateQuery = { __typename?: 'Query', sourceTemplate: { __typename?: 'SourceTemplateType', id: string, planId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, config?: any | null, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, errorMessage?: string | null, startedAt: any, jobCount: number }> } };

export type SourceTemplatesAllQueryVariables = Exact<{ [key: string]: never; }>;


export type SourceTemplatesAllQuery = { __typename?: 'Query', sourceTemplates: Array<{ __typename?: 'SourceTemplateType', id: string, planId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, config?: any | null, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, errorMessage?: string | null, startedAt: any, jobCount: number }> }> };

export type UpdateSourceTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSourceTemplateInput;
}>;


export type UpdateSourceTemplateMutation = { __typename?: 'Mutation', updateSourceTemplate: { __typename?: 'SourceTemplateType', id: string, planId: string, scheduleCron?: string | null, scheduleEnabled: boolean, surfaceUrl: string, createdAt: any, config?: any | null, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, errorMessage?: string | null, startedAt: any, jobCount: number }> } };

export type DeleteSourceTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSourceTemplateMutation = { __typename?: 'Mutation', deleteSourceTemplate: { __typename?: 'DeleteMutationPayloadType', success: boolean, deletedId: string } };

export type CreateSourceTemplateMutationVariables = Exact<{
  input: CreateSourceTemplateInput;
}>;


export type CreateSourceTemplateMutation = { __typename?: 'Mutation', createSourceTemplate: { __typename?: 'SourceTemplateType', id: string, planId: string, surfaceUrl: string, scheduleCron?: string | null, scheduleEnabled: boolean, createdAt: any, config?: any | null } };

export type PlansQueryVariables = Exact<{ [key: string]: never; }>;


export type PlansQuery = { __typename?: 'Query', plans: Array<{ __typename?: 'PlanType', id: string, displayName: string, templates: Array<{ __typename?: 'SourceTemplateType', id: string, surfaceUrl: string, createdAt: any, config?: any | null, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, errorMessage?: string | null, startedAt: any, jobCount: number }> }> }> };

export type SourceRunActivityEventsQueryVariables = Exact<{
  runId: Scalars['ID']['input'];
}>;


export type SourceRunActivityEventsQuery = { __typename?: 'Query', sourceRunActivityEvents: Array<{ __typename?: 'SourceRunActivityEvent', type: string, summary: string, payload?: any | null, occurredAt: any }> };

export type SourceRunActivityEventsLiveSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SourceRunActivityEventsLiveSubscription = { __typename?: 'Subscription', extensionActivityEvents: { __typename?: 'ExtensionActivityEvent', id: string, type: ExtensionActivityEventType, summary: string, payload?: any | null, occurredAt: any, sourceRunId?: string | null } };

export type PlanQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PlanQuery = { __typename?: 'Query', plan?: { __typename?: 'PlanType', id: string, displayName: string, document: any, createdAt: any, updatedAt: any, templates: Array<{ __typename?: 'SourceTemplateType', id: string, planId: string, surfaceUrl: string, scheduleCron?: string | null, scheduleEnabled: boolean, createdAt: any, config?: any | null, runs: Array<{ __typename?: 'SourceRunType', id: string, status: SourceRunStatus, errorMessage?: string | null, startedAt: any, jobCount: number }> }> } | null };

export type UpdatePlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdatePlanInput;
}>;


export type UpdatePlanMutation = { __typename?: 'Mutation', updatePlan: { __typename?: 'PlanType', id: string, displayName: string, document: any, updatedAt: any } };

export type CreatePlanMutationVariables = Exact<{
  input: CreatePlanInput;
}>;


export type CreatePlanMutation = { __typename?: 'Mutation', createPlan: { __typename?: 'PlanType', id: string, displayName: string, document: any, createdAt: any, updatedAt: any } };

export type WorkPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkPreferencesQuery = { __typename?: 'Query', workPreferences: Array<{ __typename?: 'PreferenceType', text: string, weight: Weight }> };

export type UpdateWorkPreferencesMutationVariables = Exact<{
  items: Array<PreferenceInput> | PreferenceInput;
}>;


export type UpdateWorkPreferencesMutation = { __typename?: 'Mutation', updateWorkPreferences: Array<{ __typename?: 'PreferenceType', text: string, weight: Weight }> };

export const AiConversationFieldsFragmentDoc = gql`
    fragment AiConversationFields on AiConversationType {
  id
  jobId
  title
  createdAt
  updatedAt
}
    `;
export const AiMessageFieldsFragmentDoc = gql`
    fragment AiMessageFields on AiMessageType {
  id
  conversationId
  role
  content
  createdAt
}
    `;
export const AiMessageStreamEventFieldsFragmentDoc = gql`
    fragment AiMessageStreamEventFields on AiMessageStreamEventType {
  conversationId
  phase
  token
  userMessageId
  aiMessageId
  error
}
    `;
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
export const AdminSourceRunsListDocument = gql`
    query AdminSourceRunsList {
  sourceRuns {
    id
    templateId
    planId
    surfaceUrl
    status
    startedAt
  }
}
    `;
export const AdminSourceRunEventsDocument = gql`
    subscription AdminSourceRunEvents {
  sourceRunEvents {
    type
    occurredAt
    run {
      id
      templateId
      planId
      surfaceUrl
      status
      startedAt
    }
  }
}
    `;
export const AdminExtensionActivityEventsListDocument = gql`
    query AdminExtensionActivityEventsList($limit: Int) {
  extensionActivityEvents(limit: $limit) {
    id
    type
    summary
    sourceRunId
    occurredAt
  }
}
    `;
export const AdminExtensionActivityEventsDocument = gql`
    subscription AdminExtensionActivityEvents {
  extensionActivityEvents {
    id
    type
    summary
    sourceRunId
    occurredAt
  }
}
    `;
export const AdminUsersDocument = gql`
    query AdminUsers {
  users {
    id
    email
    name
    role
    avatarUrl
  }
}
    `;
export const AiConversationsDocument = gql`
    query AiConversations($jobId: ID!) {
  aiConversations(jobId: $jobId) {
    ...AiConversationFields
  }
}
    ${AiConversationFieldsFragmentDoc}`;
export const AiMessagesDocument = gql`
    query AiMessages($conversationId: ID!) {
  aiMessages(conversationId: $conversationId) {
    ...AiMessageFields
  }
}
    ${AiMessageFieldsFragmentDoc}`;
export const CreateAiConversationDocument = gql`
    mutation CreateAiConversation($jobId: ID!) {
  createAiConversation(jobId: $jobId) {
    ...AiConversationFields
  }
}
    ${AiConversationFieldsFragmentDoc}`;
export const DeleteAiConversationDocument = gql`
    mutation DeleteAiConversation($id: ID!) {
  deleteAiConversation(id: $id) {
    success
    deletedId
  }
}
    `;
export const AskAiQuestionDocument = gql`
    mutation AskAiQuestion($conversationId: ID!, $content: String!) {
  askAiQuestion(conversationId: $conversationId, content: $content) {
    success
  }
}
    `;
export const AiMessageStreamedDocument = gql`
    subscription AiMessageStreamed($conversationId: ID!) {
  aiMessageStreamed(conversationId: $conversationId) {
    ...AiMessageStreamEventFields
  }
}
    ${AiMessageStreamEventFieldsFragmentDoc}`;
export const AuthenticatedShellDocument = gql`
    query AuthenticatedShell {
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
  settings {
    id
    autoFillEnabled
    autoSummaryEnabled
    autoMatchEnabled
    duplicateWindowDays
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
    ${JobSalarySelectionFragmentDoc}`;
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
    ${JobSalarySelectionFragmentDoc}`;
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
    ${JobSalarySelectionFragmentDoc}`;
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
    ${JobSalarySelectionFragmentDoc}`;
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
export const RequestJobSummaryDocument = gql`
    mutation RequestJobSummary($jobId: ID!) {
  requestJobSummary(jobId: $jobId) {
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
export const JobSummaryStatusChangedDocument = gql`
    subscription JobSummaryStatusChanged($jobId: ID!) {
  jobSummaryStatusChanged(jobId: $jobId) {
    jobId
    status
    summary
    summaryMetadata {
      status
      error
      timestamp
    }
  }
}
    `;
export const JobFillStatusChangedDocument = gql`
    subscription JobFillStatusChanged($jobId: ID!) {
  jobFillStatusChanged(jobId: $jobId) {
    jobId
    status
    error
  }
}
    `;
export const JobMatchStatusChangedDocument = gql`
    subscription JobMatchStatusChanged($jobId: ID!) {
  jobMatchStatusChanged(jobId: $jobId) {
    jobId
    matchId
    status
  }
}
    `;
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
      id
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
      id
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
      id
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
    accounts {
      id
      providerName
      providerAccountId
      createdAt
    }
  }
}
    `;
export const QuickFilterCountsDocument = gql`
    query QuickFilterCounts($company: String, $runId: ID) {
  quickFilterCounts(company: $company, runId: $runId) {
    key
    count
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
export const ResumesForPickerDocument = gql`
    query ResumesForPicker {
  resumes {
    id
    title
    isDefault
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
export const SettingsDocument = gql`
    query Settings {
  settings {
    id
    autoFillEnabled
    autoSummaryEnabled
    autoMatchEnabled
    aiEnabled
    hasOpenAiKey
    duplicateWindowDays
    trialCallsUsed
    trialCallsLimit
    blockedKeywords {
      keyword
      scope
      matchMode
    }
    blockedCompanies
  }
}
    `;
export const UpdateSettingsDocument = gql`
    mutation UpdateSettings($input: UpdateSettingsInput!) {
  updateSettings(input: $input) {
    id
    autoFillEnabled
    autoSummaryEnabled
    autoMatchEnabled
    aiEnabled
    hasOpenAiKey
    duplicateWindowDays
    trialCallsUsed
    trialCallsLimit
    blockedKeywords {
      keyword
      scope
      matchMode
    }
    blockedCompanies
  }
}
    `;
export const SaveOpenAiKeyDocument = gql`
    mutation SaveOpenAiKey($key: String!) {
  saveOpenAiKey(key: $key) {
    id
    aiEnabled
    hasOpenAiKey
    trialCallsUsed
    trialCallsLimit
  }
}
    `;
export const RemoveOpenAiKeyDocument = gql`
    mutation RemoveOpenAiKey {
  removeOpenAiKey {
    id
    aiEnabled
    hasOpenAiKey
    trialCallsUsed
    trialCallsLimit
  }
}
    `;
export const AiUsageChangedDocument = gql`
    subscription AiUsageChanged {
  aiUsageChanged {
    trialCallsUsed
    hasOpenAiKey
  }
}
    `;
export const RerunSourceTemplateDocument = gql`
    mutation RerunSourceTemplate($templateId: ID!) {
  rerunSourceTemplate(templateId: $templateId) {
    id
    status
    startedAt
    surfaceUrl
    planId
  }
}
    `;
export const SourceRunEventsDocument = gql`
    subscription SourceRunEvents {
  sourceRunEvents {
    type
    occurredAt
    run {
      id
      templateId
      status
      errorMessage
    }
  }
}
    `;
export const ClearSourceTemplateRunsDocument = gql`
    mutation ClearSourceTemplateRuns($templateId: ID!, $deleteJobs: Boolean = false) {
  clearSourceTemplateRuns(templateId: $templateId, deleteJobs: $deleteJobs)
}
    `;
export const DeleteSourceRunDocument = gql`
    mutation DeleteSourceRun($id: ID!, $deleteJobs: Boolean = false) {
  deleteSourceRun(id: $id, deleteJobs: $deleteJobs) {
    success
    deletedId
  }
}
    `;
export const SourceTemplateDocument = gql`
    query SourceTemplate($id: ID!) {
  sourceTemplate(id: $id) {
    id
    planId
    scheduleCron
    scheduleEnabled
    surfaceUrl
    createdAt
    config
    runs {
      id
      status
      errorMessage
      startedAt
      jobCount
    }
  }
}
    `;
export const SourceTemplatesAllDocument = gql`
    query SourceTemplatesAll {
  sourceTemplates {
    id
    planId
    scheduleCron
    scheduleEnabled
    surfaceUrl
    createdAt
    config
    runs {
      id
      status
      errorMessage
      startedAt
      jobCount
    }
  }
}
    `;
export const UpdateSourceTemplateDocument = gql`
    mutation UpdateSourceTemplate($id: ID!, $input: UpdateSourceTemplateInput!) {
  updateSourceTemplate(id: $id, input: $input) {
    id
    planId
    scheduleCron
    scheduleEnabled
    surfaceUrl
    createdAt
    config
    runs {
      id
      status
      errorMessage
      startedAt
      jobCount
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
    planId
    surfaceUrl
    scheduleCron
    scheduleEnabled
    createdAt
    config
  }
}
    `;
export const PlansDocument = gql`
    query Plans {
  plans {
    id
    displayName
    templates {
      id
      surfaceUrl
      createdAt
      config
      runs {
        id
        status
        errorMessage
        startedAt
        jobCount
      }
    }
  }
}
    `;
export const SourceRunActivityEventsDocument = gql`
    query SourceRunActivityEvents($runId: ID!) {
  sourceRunActivityEvents(runId: $runId) {
    type
    summary
    payload
    occurredAt
  }
}
    `;
export const SourceRunActivityEventsLiveDocument = gql`
    subscription SourceRunActivityEventsLive {
  extensionActivityEvents {
    id
    type
    summary
    payload
    occurredAt
    sourceRunId
  }
}
    `;
export const PlanDocument = gql`
    query Plan($id: ID!) {
  plan(id: $id) {
    id
    displayName
    document
    createdAt
    updatedAt
    templates {
      id
      planId
      surfaceUrl
      scheduleCron
      scheduleEnabled
      createdAt
      config
      runs {
        id
        status
        errorMessage
        startedAt
        jobCount
      }
    }
  }
}
    `;
export const UpdatePlanDocument = gql`
    mutation UpdatePlan($id: ID!, $input: UpdatePlanInput!) {
  updatePlan(id: $id, input: $input) {
    id
    displayName
    document
    updatedAt
  }
}
    `;
export const CreatePlanDocument = gql`
    mutation CreatePlan($input: CreatePlanInput!) {
  createPlan(input: $input) {
    id
    displayName
    document
    createdAt
    updatedAt
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AdminSourceRunsList(variables?: AdminSourceRunsListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AdminSourceRunsListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdminSourceRunsListQuery>({ document: AdminSourceRunsListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AdminSourceRunsList', 'query', variables);
    },
    AdminSourceRunEvents(variables?: AdminSourceRunEventsSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AdminSourceRunEventsSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdminSourceRunEventsSubscription>({ document: AdminSourceRunEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AdminSourceRunEvents', 'subscription', variables);
    },
    AdminExtensionActivityEventsList(variables?: AdminExtensionActivityEventsListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AdminExtensionActivityEventsListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdminExtensionActivityEventsListQuery>({ document: AdminExtensionActivityEventsListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AdminExtensionActivityEventsList', 'query', variables);
    },
    AdminExtensionActivityEvents(variables?: AdminExtensionActivityEventsSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AdminExtensionActivityEventsSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdminExtensionActivityEventsSubscription>({ document: AdminExtensionActivityEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AdminExtensionActivityEvents', 'subscription', variables);
    },
    AdminUsers(variables?: AdminUsersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AdminUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AdminUsersQuery>({ document: AdminUsersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AdminUsers', 'query', variables);
    },
    AiConversations(variables: AiConversationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AiConversationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AiConversationsQuery>({ document: AiConversationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AiConversations', 'query', variables);
    },
    AiMessages(variables: AiMessagesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AiMessagesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AiMessagesQuery>({ document: AiMessagesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AiMessages', 'query', variables);
    },
    CreateAiConversation(variables: CreateAiConversationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateAiConversationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateAiConversationMutation>({ document: CreateAiConversationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateAiConversation', 'mutation', variables);
    },
    DeleteAiConversation(variables: DeleteAiConversationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteAiConversationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteAiConversationMutation>({ document: DeleteAiConversationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteAiConversation', 'mutation', variables);
    },
    AskAiQuestion(variables: AskAiQuestionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AskAiQuestionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AskAiQuestionMutation>({ document: AskAiQuestionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AskAiQuestion', 'mutation', variables);
    },
    AiMessageStreamed(variables: AiMessageStreamedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AiMessageStreamedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<AiMessageStreamedSubscription>({ document: AiMessageStreamedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AiMessageStreamed', 'subscription', variables);
    },
    AuthenticatedShell(variables?: AuthenticatedShellQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AuthenticatedShellQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AuthenticatedShellQuery>({ document: AuthenticatedShellDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AuthenticatedShell', 'query', variables);
    },
    UpdateCompany(variables: UpdateCompanyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateCompanyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCompanyMutation>({ document: UpdateCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateCompany', 'mutation', variables);
    },
    DeleteCompany(variables: DeleteCompanyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteCompanyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteCompanyMutation>({ document: DeleteCompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteCompany', 'mutation', variables);
    },
    CompanyJobsCount(variables: CompanyJobsCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CompanyJobsCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompanyJobsCountQuery>({ document: CompanyJobsCountDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CompanyJobsCount', 'query', variables);
    },
    Companies(variables?: CompaniesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CompaniesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompaniesQuery>({ document: CompaniesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Companies', 'query', variables);
    },
    Company(variables: CompanyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CompanyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompanyQuery>({ document: CompanyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Company', 'query', variables);
    },
    ExchangeRates(variables: ExchangeRatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ExchangeRatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExchangeRatesQuery>({ document: ExchangeRatesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ExchangeRates', 'query', variables);
    },
    Jobs(variables?: JobsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobsQuery>({ document: JobsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Jobs', 'query', variables);
    },
    Job(variables: JobQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobQuery>({ document: JobDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Job', 'query', variables);
    },
    CreateJob(variables: CreateJobMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateJobMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateJobMutation>({ document: CreateJobDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateJob', 'mutation', variables);
    },
    GenerateCompanyDescription(variables: GenerateCompanyDescriptionQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateCompanyDescriptionQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateCompanyDescriptionQuery>({ document: GenerateCompanyDescriptionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateCompanyDescription', 'query', variables);
    },
    UpdateJob(variables: UpdateJobMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateJobMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateJobMutation>({ document: UpdateJobDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateJob', 'mutation', variables);
    },
    RemoveJobTag(variables: RemoveJobTagMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RemoveJobTagMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveJobTagMutation>({ document: RemoveJobTagDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RemoveJobTag', 'mutation', variables);
    },
    DeleteJob(variables: DeleteJobMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteJobMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteJobMutation>({ document: DeleteJobDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteJob', 'mutation', variables);
    },
    JobStageEvents(variables: JobStageEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobStageEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobStageEventsQuery>({ document: JobStageEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobStageEvents', 'query', variables);
    },
    CreateJobStageEvent(variables: CreateJobStageEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateJobStageEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateJobStageEventMutation>({ document: CreateJobStageEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateJobStageEvent', 'mutation', variables);
    },
    UpdateJobStageEvent(variables: UpdateJobStageEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateJobStageEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateJobStageEventMutation>({ document: UpdateJobStageEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateJobStageEvent', 'mutation', variables);
    },
    DeleteJobStageEvent(variables: DeleteJobStageEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteJobStageEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteJobStageEventMutation>({ document: DeleteJobStageEventDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteJobStageEvent', 'mutation', variables);
    },
    JobNotes(variables: JobNotesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobNotesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobNotesQuery>({ document: JobNotesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobNotes', 'query', variables);
    },
    CreateJobNote(variables: CreateJobNoteMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateJobNoteMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateJobNoteMutation>({ document: CreateJobNoteDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateJobNote', 'mutation', variables);
    },
    UpdateJobNote(variables: UpdateJobNoteMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateJobNoteMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateJobNoteMutation>({ document: UpdateJobNoteDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateJobNote', 'mutation', variables);
    },
    DeleteJobNote(variables: DeleteJobNoteMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteJobNoteMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteJobNoteMutation>({ document: DeleteJobNoteDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteJobNote', 'mutation', variables);
    },
    GenerateJobNoteWithAi(variables: GenerateJobNoteWithAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateJobNoteWithAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateJobNoteWithAiQuery>({ document: GenerateJobNoteWithAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateJobNoteWithAi', 'query', variables);
    },
    RewriteTextWithAi(variables: RewriteTextWithAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RewriteTextWithAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RewriteTextWithAiQuery>({ document: RewriteTextWithAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RewriteTextWithAi', 'query', variables);
    },
    RestructureJobDescriptionWithAi(variables: RestructureJobDescriptionWithAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RestructureJobDescriptionWithAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RestructureJobDescriptionWithAiQuery>({ document: RestructureJobDescriptionWithAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RestructureJobDescriptionWithAi', 'query', variables);
    },
    GenerateJobLocationWithAi(variables: GenerateJobLocationWithAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateJobLocationWithAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateJobLocationWithAiQuery>({ document: GenerateJobLocationWithAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateJobLocationWithAi', 'query', variables);
    },
    GenerateJobWorkRegionWithAi(variables: GenerateJobWorkRegionWithAiQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateJobWorkRegionWithAiQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateJobWorkRegionWithAiQuery>({ document: GenerateJobWorkRegionWithAiDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateJobWorkRegionWithAi', 'query', variables);
    },
    RequestJobSummary(variables: RequestJobSummaryMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RequestJobSummaryMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RequestJobSummaryMutation>({ document: RequestJobSummaryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RequestJobSummary', 'mutation', variables);
    },
    FillJobAutomatically(variables: FillJobAutomaticallyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FillJobAutomaticallyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<FillJobAutomaticallyMutation>({ document: FillJobAutomaticallyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FillJobAutomatically', 'mutation', variables);
    },
    CreateDraftCaptureJob(variables: CreateDraftCaptureJobMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateDraftCaptureJobMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateDraftCaptureJobMutation>({ document: CreateDraftCaptureJobDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateDraftCaptureJob', 'mutation', variables);
    },
    JobSummaryStatusChanged(variables: JobSummaryStatusChangedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobSummaryStatusChangedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobSummaryStatusChangedSubscription>({ document: JobSummaryStatusChangedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobSummaryStatusChanged', 'subscription', variables);
    },
    JobFillStatusChanged(variables: JobFillStatusChangedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobFillStatusChangedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobFillStatusChangedSubscription>({ document: JobFillStatusChangedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobFillStatusChanged', 'subscription', variables);
    },
    JobMatchStatusChanged(variables: JobMatchStatusChangedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobMatchStatusChangedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobMatchStatusChangedSubscription>({ document: JobMatchStatusChangedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobMatchStatusChanged', 'subscription', variables);
    },
    MatchAnalysesList(variables?: MatchAnalysesListQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MatchAnalysesListQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MatchAnalysesListQuery>({ document: MatchAnalysesListDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'MatchAnalysesList', 'query', variables);
    },
    Match(variables: MatchQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MatchQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MatchQuery>({ document: MatchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Match', 'query', variables);
    },
    JobMatch(variables: JobMatchQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<JobMatchQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<JobMatchQuery>({ document: JobMatchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'JobMatch', 'query', variables);
    },
    GenerateJobMatch(variables: GenerateJobMatchMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateJobMatchMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateJobMatchMutation>({ document: GenerateJobMatchDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateJobMatch', 'mutation', variables);
    },
    DeleteMatchAnalysis(variables: DeleteMatchAnalysisMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteMatchAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteMatchAnalysisMutation>({ document: DeleteMatchAnalysisDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteMatchAnalysis', 'mutation', variables);
    },
    Me(variables?: MeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<MeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeQuery>({ document: MeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Me', 'query', variables);
    },
    QuickFilterCounts(variables?: QuickFilterCountsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<QuickFilterCountsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<QuickFilterCountsQuery>({ document: QuickFilterCountsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'QuickFilterCounts', 'query', variables);
    },
    Resumes(variables?: ResumesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ResumesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumesQuery>({ document: ResumesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Resumes', 'query', variables);
    },
    ResumesForPicker(variables?: ResumesForPickerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ResumesForPickerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumesForPickerQuery>({ document: ResumesForPickerDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ResumesForPicker', 'query', variables);
    },
    Resume(variables: ResumeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ResumeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumeQuery>({ document: ResumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Resume', 'query', variables);
    },
    CreateResume(variables: CreateResumeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateResumeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateResumeMutation>({ document: CreateResumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateResume', 'mutation', variables);
    },
    UpdateResume(variables: UpdateResumeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateResumeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateResumeMutation>({ document: UpdateResumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateResume', 'mutation', variables);
    },
    DeleteResume(variables: DeleteResumeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteResumeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteResumeMutation>({ document: DeleteResumeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteResume', 'mutation', variables);
    },
    Settings(variables?: SettingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SettingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SettingsQuery>({ document: SettingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Settings', 'query', variables);
    },
    UpdateSettings(variables: UpdateSettingsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateSettingsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSettingsMutation>({ document: UpdateSettingsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateSettings', 'mutation', variables);
    },
    SaveOpenAiKey(variables: SaveOpenAiKeyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveOpenAiKeyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveOpenAiKeyMutation>({ document: SaveOpenAiKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveOpenAiKey', 'mutation', variables);
    },
    RemoveOpenAiKey(variables?: RemoveOpenAiKeyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RemoveOpenAiKeyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RemoveOpenAiKeyMutation>({ document: RemoveOpenAiKeyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RemoveOpenAiKey', 'mutation', variables);
    },
    AiUsageChanged(variables?: AiUsageChangedSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AiUsageChangedSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<AiUsageChangedSubscription>({ document: AiUsageChangedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AiUsageChanged', 'subscription', variables);
    },
    RerunSourceTemplate(variables: RerunSourceTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RerunSourceTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RerunSourceTemplateMutation>({ document: RerunSourceTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RerunSourceTemplate', 'mutation', variables);
    },
    SourceRunEvents(variables?: SourceRunEventsSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SourceRunEventsSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceRunEventsSubscription>({ document: SourceRunEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SourceRunEvents', 'subscription', variables);
    },
    ClearSourceTemplateRuns(variables: ClearSourceTemplateRunsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ClearSourceTemplateRunsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ClearSourceTemplateRunsMutation>({ document: ClearSourceTemplateRunsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ClearSourceTemplateRuns', 'mutation', variables);
    },
    DeleteSourceRun(variables: DeleteSourceRunMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteSourceRunMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteSourceRunMutation>({ document: DeleteSourceRunDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteSourceRun', 'mutation', variables);
    },
    SourceTemplate(variables: SourceTemplateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SourceTemplateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceTemplateQuery>({ document: SourceTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SourceTemplate', 'query', variables);
    },
    SourceTemplatesAll(variables?: SourceTemplatesAllQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SourceTemplatesAllQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceTemplatesAllQuery>({ document: SourceTemplatesAllDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SourceTemplatesAll', 'query', variables);
    },
    UpdateSourceTemplate(variables: UpdateSourceTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateSourceTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSourceTemplateMutation>({ document: UpdateSourceTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateSourceTemplate', 'mutation', variables);
    },
    DeleteSourceTemplate(variables: DeleteSourceTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DeleteSourceTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteSourceTemplateMutation>({ document: DeleteSourceTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'DeleteSourceTemplate', 'mutation', variables);
    },
    CreateSourceTemplate(variables: CreateSourceTemplateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateSourceTemplateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateSourceTemplateMutation>({ document: CreateSourceTemplateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateSourceTemplate', 'mutation', variables);
    },
    Plans(variables?: PlansQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PlansQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlansQuery>({ document: PlansDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Plans', 'query', variables);
    },
    SourceRunActivityEvents(variables: SourceRunActivityEventsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SourceRunActivityEventsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceRunActivityEventsQuery>({ document: SourceRunActivityEventsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SourceRunActivityEvents', 'query', variables);
    },
    SourceRunActivityEventsLive(variables?: SourceRunActivityEventsLiveSubscriptionVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SourceRunActivityEventsLiveSubscription> {
      return withWrapper((wrappedRequestHeaders) => client.request<SourceRunActivityEventsLiveSubscription>({ document: SourceRunActivityEventsLiveDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SourceRunActivityEventsLive', 'subscription', variables);
    },
    Plan(variables: PlanQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PlanQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlanQuery>({ document: PlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Plan', 'query', variables);
    },
    UpdatePlan(variables: UpdatePlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdatePlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdatePlanMutation>({ document: UpdatePlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdatePlan', 'mutation', variables);
    },
    CreatePlan(variables: CreatePlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreatePlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreatePlanMutation>({ document: CreatePlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreatePlan', 'mutation', variables);
    },
    WorkPreferences(variables?: WorkPreferencesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<WorkPreferencesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<WorkPreferencesQuery>({ document: WorkPreferencesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'WorkPreferences', 'query', variables);
    },
    UpdateWorkPreferences(variables: UpdateWorkPreferencesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkPreferencesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkPreferencesMutation>({ document: UpdateWorkPreferencesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkPreferences', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;