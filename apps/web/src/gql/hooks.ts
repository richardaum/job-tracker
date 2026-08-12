import { gql } from '@apollo/client';
import type * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  saveTourProgress: TourProgressType;
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


export type MutationSaveTourProgressArgs = {
  input: SaveTourProgressInput;
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
  tourProgress?: Maybe<TourProgressType>;
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


export type QueryTourProgressArgs = {
  tourId: Scalars['String']['input'];
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

export type SaveTourProgressInput = {
  currentStepId?: InputMaybe<Scalars['String']['input']>;
  status: TourProgressStatus;
  tourId: Scalars['String']['input'];
  tourVersion: Scalars['Int']['input'];
};

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

export enum TourProgressStatus {
  Completed = 'Completed',
  InProgress = 'InProgress',
  Skipped = 'Skipped'
}

export type TourProgressType = {
  __typename?: 'TourProgressType';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentStepId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  skippedAt?: Maybe<Scalars['DateTime']['output']>;
  status: TourProgressStatus;
  tourId: Scalars['String']['output'];
  tourVersion: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type TourProgressQueryVariables = Exact<{
  tourId: Scalars['String']['input'];
}>;


export type TourProgressQuery = { __typename?: 'Query', tourProgress?: { __typename?: 'TourProgressType', id: string, tourId: string, tourVersion: number, status: TourProgressStatus, currentStepId?: string | null } | null };

export type SaveTourProgressMutationVariables = Exact<{
  input: SaveTourProgressInput;
}>;


export type SaveTourProgressMutation = { __typename?: 'Mutation', saveTourProgress: { __typename?: 'TourProgressType', id: string, tourId: string, tourVersion: number, status: TourProgressStatus, currentStepId?: string | null } };

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

/**
 * __useAdminSourceRunsListQuery__
 *
 * To run a query within a React component, call `useAdminSourceRunsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminSourceRunsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSourceRunsListQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminSourceRunsListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AdminSourceRunsListQuery, AdminSourceRunsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AdminSourceRunsListQuery, AdminSourceRunsListQueryVariables>(AdminSourceRunsListDocument, options);
      }
export function useAdminSourceRunsListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AdminSourceRunsListQuery, AdminSourceRunsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AdminSourceRunsListQuery, AdminSourceRunsListQueryVariables>(AdminSourceRunsListDocument, options);
        }

export type AdminSourceRunsListQueryHookResult = ReturnType<typeof useAdminSourceRunsListQuery>;
export type AdminSourceRunsListLazyQueryHookResult = ReturnType<typeof useAdminSourceRunsListLazyQuery>;

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

/**
 * __useAdminSourceRunEventsSubscription__
 *
 * To run a query within a React component, call `useAdminSourceRunEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAdminSourceRunEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminSourceRunEventsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAdminSourceRunEventsSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<AdminSourceRunEventsSubscription, AdminSourceRunEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<AdminSourceRunEventsSubscription, AdminSourceRunEventsSubscriptionVariables>(AdminSourceRunEventsDocument, options);
      }
export type AdminSourceRunEventsSubscriptionHookResult = ReturnType<typeof useAdminSourceRunEventsSubscription>;

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

/**
 * __useAdminExtensionActivityEventsListQuery__
 *
 * To run a query within a React component, call `useAdminExtensionActivityEventsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminExtensionActivityEventsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminExtensionActivityEventsListQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useAdminExtensionActivityEventsListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AdminExtensionActivityEventsListQuery, AdminExtensionActivityEventsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AdminExtensionActivityEventsListQuery, AdminExtensionActivityEventsListQueryVariables>(AdminExtensionActivityEventsListDocument, options);
      }
export function useAdminExtensionActivityEventsListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AdminExtensionActivityEventsListQuery, AdminExtensionActivityEventsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AdminExtensionActivityEventsListQuery, AdminExtensionActivityEventsListQueryVariables>(AdminExtensionActivityEventsListDocument, options);
        }

export type AdminExtensionActivityEventsListQueryHookResult = ReturnType<typeof useAdminExtensionActivityEventsListQuery>;
export type AdminExtensionActivityEventsListLazyQueryHookResult = ReturnType<typeof useAdminExtensionActivityEventsListLazyQuery>;

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

/**
 * __useAdminExtensionActivityEventsSubscription__
 *
 * To run a query within a React component, call `useAdminExtensionActivityEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAdminExtensionActivityEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminExtensionActivityEventsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAdminExtensionActivityEventsSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<AdminExtensionActivityEventsSubscription, AdminExtensionActivityEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<AdminExtensionActivityEventsSubscription, AdminExtensionActivityEventsSubscriptionVariables>(AdminExtensionActivityEventsDocument, options);
      }
export type AdminExtensionActivityEventsSubscriptionHookResult = ReturnType<typeof useAdminExtensionActivityEventsSubscription>;

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

/**
 * __useAdminUsersQuery__
 *
 * To run a query within a React component, call `useAdminUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminUsersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AdminUsersQuery, AdminUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AdminUsersQuery, AdminUsersQueryVariables>(AdminUsersDocument, options);
      }
export function useAdminUsersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AdminUsersQuery, AdminUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AdminUsersQuery, AdminUsersQueryVariables>(AdminUsersDocument, options);
        }

export type AdminUsersQueryHookResult = ReturnType<typeof useAdminUsersQuery>;
export type AdminUsersLazyQueryHookResult = ReturnType<typeof useAdminUsersLazyQuery>;

export const AiConversationsDocument = gql`
    query AiConversations($jobId: ID!) {
  aiConversations(jobId: $jobId) {
    ...AiConversationFields
  }
}
    ${AiConversationFieldsFragmentDoc}`;

/**
 * __useAiConversationsQuery__
 *
 * To run a query within a React component, call `useAiConversationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAiConversationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiConversationsQuery({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useAiConversationsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AiConversationsQuery, AiConversationsQueryVariables> & ({ variables: AiConversationsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AiConversationsQuery, AiConversationsQueryVariables>(AiConversationsDocument, options);
      }
export function useAiConversationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AiConversationsQuery, AiConversationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AiConversationsQuery, AiConversationsQueryVariables>(AiConversationsDocument, options);
        }

export type AiConversationsQueryHookResult = ReturnType<typeof useAiConversationsQuery>;
export type AiConversationsLazyQueryHookResult = ReturnType<typeof useAiConversationsLazyQuery>;

export const AiMessagesDocument = gql`
    query AiMessages($conversationId: ID!) {
  aiMessages(conversationId: $conversationId) {
    ...AiMessageFields
  }
}
    ${AiMessageFieldsFragmentDoc}`;

/**
 * __useAiMessagesQuery__
 *
 * To run a query within a React component, call `useAiMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAiMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiMessagesQuery({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *   },
 * });
 */
export function useAiMessagesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AiMessagesQuery, AiMessagesQueryVariables> & ({ variables: AiMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AiMessagesQuery, AiMessagesQueryVariables>(AiMessagesDocument, options);
      }
export function useAiMessagesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AiMessagesQuery, AiMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AiMessagesQuery, AiMessagesQueryVariables>(AiMessagesDocument, options);
        }

export type AiMessagesQueryHookResult = ReturnType<typeof useAiMessagesQuery>;
export type AiMessagesLazyQueryHookResult = ReturnType<typeof useAiMessagesLazyQuery>;

export const CreateAiConversationDocument = gql`
    mutation CreateAiConversation($jobId: ID!) {
  createAiConversation(jobId: $jobId) {
    ...AiConversationFields
  }
}
    ${AiConversationFieldsFragmentDoc}`;


/**
 * __useCreateAiConversationMutation__
 *
 * To run a mutation, you first call `useCreateAiConversationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAiConversationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAiConversationMutation, { data, loading, error }] = useCreateAiConversationMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useCreateAiConversationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateAiConversationMutation, CreateAiConversationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateAiConversationMutation, CreateAiConversationMutationVariables>(CreateAiConversationDocument, options);
      }


export const DeleteAiConversationDocument = gql`
    mutation DeleteAiConversation($id: ID!) {
  deleteAiConversation(id: $id) {
    success
    deletedId
  }
}
    `;


/**
 * __useDeleteAiConversationMutation__
 *
 * To run a mutation, you first call `useDeleteAiConversationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAiConversationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAiConversationMutation, { data, loading, error }] = useDeleteAiConversationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAiConversationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteAiConversationMutation, DeleteAiConversationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteAiConversationMutation, DeleteAiConversationMutationVariables>(DeleteAiConversationDocument, options);
      }


export const AskAiQuestionDocument = gql`
    mutation AskAiQuestion($conversationId: ID!, $content: String!) {
  askAiQuestion(conversationId: $conversationId, content: $content) {
    success
  }
}
    `;


/**
 * __useAskAiQuestionMutation__
 *
 * To run a mutation, you first call `useAskAiQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAskAiQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [askAiQuestionMutation, { data, loading, error }] = useAskAiQuestionMutation({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useAskAiQuestionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AskAiQuestionMutation, AskAiQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AskAiQuestionMutation, AskAiQuestionMutationVariables>(AskAiQuestionDocument, options);
      }


export const AiMessageStreamedDocument = gql`
    subscription AiMessageStreamed($conversationId: ID!) {
  aiMessageStreamed(conversationId: $conversationId) {
    ...AiMessageStreamEventFields
  }
}
    ${AiMessageStreamEventFieldsFragmentDoc}`;

/**
 * __useAiMessageStreamedSubscription__
 *
 * To run a query within a React component, call `useAiMessageStreamedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAiMessageStreamedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiMessageStreamedSubscription({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *   },
 * });
 */
export function useAiMessageStreamedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<AiMessageStreamedSubscription, AiMessageStreamedSubscriptionVariables> & ({ variables: AiMessageStreamedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<AiMessageStreamedSubscription, AiMessageStreamedSubscriptionVariables>(AiMessageStreamedDocument, options);
      }
export type AiMessageStreamedSubscriptionHookResult = ReturnType<typeof useAiMessageStreamedSubscription>;

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

/**
 * __useAuthenticatedShellQuery__
 *
 * To run a query within a React component, call `useAuthenticatedShellQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthenticatedShellQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthenticatedShellQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuthenticatedShellQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AuthenticatedShellQuery, AuthenticatedShellQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AuthenticatedShellQuery, AuthenticatedShellQueryVariables>(AuthenticatedShellDocument, options);
      }
export function useAuthenticatedShellLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AuthenticatedShellQuery, AuthenticatedShellQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AuthenticatedShellQuery, AuthenticatedShellQueryVariables>(AuthenticatedShellDocument, options);
        }

export type AuthenticatedShellQueryHookResult = ReturnType<typeof useAuthenticatedShellQuery>;
export type AuthenticatedShellLazyQueryHookResult = ReturnType<typeof useAuthenticatedShellLazyQuery>;

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
export function useUpdateCompanyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateCompanyMutation, UpdateCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateCompanyMutation, UpdateCompanyMutationVariables>(UpdateCompanyDocument, options);
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
export function useDeleteCompanyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteCompanyMutation, DeleteCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteCompanyMutation, DeleteCompanyMutationVariables>(DeleteCompanyDocument, options);
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
export function useCompanyJobsCountQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CompanyJobsCountQuery, CompanyJobsCountQueryVariables> & ({ variables: CompanyJobsCountQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CompanyJobsCountQuery, CompanyJobsCountQueryVariables>(CompanyJobsCountDocument, options);
      }
export function useCompanyJobsCountLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CompanyJobsCountQuery, CompanyJobsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CompanyJobsCountQuery, CompanyJobsCountQueryVariables>(CompanyJobsCountDocument, options);
        }

export type CompanyJobsCountQueryHookResult = ReturnType<typeof useCompanyJobsCountQuery>;
export type CompanyJobsCountLazyQueryHookResult = ReturnType<typeof useCompanyJobsCountLazyQuery>;

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
export function useCompaniesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CompaniesQuery, CompaniesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CompaniesQuery, CompaniesQueryVariables>(CompaniesDocument, options);
      }
export function useCompaniesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CompaniesQuery, CompaniesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CompaniesQuery, CompaniesQueryVariables>(CompaniesDocument, options);
        }

export type CompaniesQueryHookResult = ReturnType<typeof useCompaniesQuery>;
export type CompaniesLazyQueryHookResult = ReturnType<typeof useCompaniesLazyQuery>;

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
export function useCompanyQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CompanyQuery, CompanyQueryVariables> & ({ variables: CompanyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, options);
      }
export function useCompanyLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, options);
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
export function useExchangeRatesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ExchangeRatesQuery, ExchangeRatesQueryVariables> & ({ variables: ExchangeRatesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ExchangeRatesQuery, ExchangeRatesQueryVariables>(ExchangeRatesDocument, options);
      }
export function useExchangeRatesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ExchangeRatesQuery, ExchangeRatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ExchangeRatesQuery, ExchangeRatesQueryVariables>(ExchangeRatesDocument, options);
        }

export type ExchangeRatesQueryHookResult = ReturnType<typeof useExchangeRatesQuery>;
export type ExchangeRatesLazyQueryHookResult = ReturnType<typeof useExchangeRatesLazyQuery>;

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
export function useJobsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<JobsQuery, JobsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<JobsQuery, JobsQueryVariables>(JobsDocument, options);
      }
export function useJobsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<JobsQuery, JobsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<JobsQuery, JobsQueryVariables>(JobsDocument, options);
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
    ${JobSalarySelectionFragmentDoc}`;

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
export function useJobQuery(baseOptions: ApolloReactHooks.QueryHookOptions<JobQuery, JobQueryVariables> & ({ variables: JobQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<JobQuery, JobQueryVariables>(JobDocument, options);
      }
export function useJobLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<JobQuery, JobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<JobQuery, JobQueryVariables>(JobDocument, options);
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
    ${JobSalarySelectionFragmentDoc}`;


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
export function useCreateJobMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateJobMutation, CreateJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateJobMutation, CreateJobMutationVariables>(CreateJobDocument, options);
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
export function useGenerateCompanyDescriptionQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GenerateCompanyDescriptionQuery, GenerateCompanyDescriptionQueryVariables> & ({ variables: GenerateCompanyDescriptionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GenerateCompanyDescriptionQuery, GenerateCompanyDescriptionQueryVariables>(GenerateCompanyDescriptionDocument, options);
      }
export function useGenerateCompanyDescriptionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GenerateCompanyDescriptionQuery, GenerateCompanyDescriptionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GenerateCompanyDescriptionQuery, GenerateCompanyDescriptionQueryVariables>(GenerateCompanyDescriptionDocument, options);
        }

export type GenerateCompanyDescriptionQueryHookResult = ReturnType<typeof useGenerateCompanyDescriptionQuery>;
export type GenerateCompanyDescriptionLazyQueryHookResult = ReturnType<typeof useGenerateCompanyDescriptionLazyQuery>;

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
export function useUpdateJobMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateJobMutation, UpdateJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateJobMutation, UpdateJobMutationVariables>(UpdateJobDocument, options);
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
export function useRemoveJobTagMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveJobTagMutation, RemoveJobTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RemoveJobTagMutation, RemoveJobTagMutationVariables>(RemoveJobTagDocument, options);
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
export function useDeleteJobMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteJobMutation, DeleteJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteJobMutation, DeleteJobMutationVariables>(DeleteJobDocument, options);
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
export function useJobStageEventsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<JobStageEventsQuery, JobStageEventsQueryVariables> & ({ variables: JobStageEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<JobStageEventsQuery, JobStageEventsQueryVariables>(JobStageEventsDocument, options);
      }
export function useJobStageEventsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<JobStageEventsQuery, JobStageEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<JobStageEventsQuery, JobStageEventsQueryVariables>(JobStageEventsDocument, options);
        }

export type JobStageEventsQueryHookResult = ReturnType<typeof useJobStageEventsQuery>;
export type JobStageEventsLazyQueryHookResult = ReturnType<typeof useJobStageEventsLazyQuery>;

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
export function useCreateJobStageEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateJobStageEventMutation, CreateJobStageEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateJobStageEventMutation, CreateJobStageEventMutationVariables>(CreateJobStageEventDocument, options);
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
export function useUpdateJobStageEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateJobStageEventMutation, UpdateJobStageEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateJobStageEventMutation, UpdateJobStageEventMutationVariables>(UpdateJobStageEventDocument, options);
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
export function useDeleteJobStageEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteJobStageEventMutation, DeleteJobStageEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteJobStageEventMutation, DeleteJobStageEventMutationVariables>(DeleteJobStageEventDocument, options);
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
export function useJobNotesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<JobNotesQuery, JobNotesQueryVariables> & ({ variables: JobNotesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<JobNotesQuery, JobNotesQueryVariables>(JobNotesDocument, options);
      }
export function useJobNotesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<JobNotesQuery, JobNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<JobNotesQuery, JobNotesQueryVariables>(JobNotesDocument, options);
        }

export type JobNotesQueryHookResult = ReturnType<typeof useJobNotesQuery>;
export type JobNotesLazyQueryHookResult = ReturnType<typeof useJobNotesLazyQuery>;

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
export function useCreateJobNoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateJobNoteMutation, CreateJobNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateJobNoteMutation, CreateJobNoteMutationVariables>(CreateJobNoteDocument, options);
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
export function useUpdateJobNoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateJobNoteMutation, UpdateJobNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateJobNoteMutation, UpdateJobNoteMutationVariables>(UpdateJobNoteDocument, options);
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
export function useDeleteJobNoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteJobNoteMutation, DeleteJobNoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteJobNoteMutation, DeleteJobNoteMutationVariables>(DeleteJobNoteDocument, options);
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
export function useGenerateJobNoteWithAiQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GenerateJobNoteWithAiQuery, GenerateJobNoteWithAiQueryVariables> & ({ variables: GenerateJobNoteWithAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GenerateJobNoteWithAiQuery, GenerateJobNoteWithAiQueryVariables>(GenerateJobNoteWithAiDocument, options);
      }
export function useGenerateJobNoteWithAiLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GenerateJobNoteWithAiQuery, GenerateJobNoteWithAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GenerateJobNoteWithAiQuery, GenerateJobNoteWithAiQueryVariables>(GenerateJobNoteWithAiDocument, options);
        }

export type GenerateJobNoteWithAiQueryHookResult = ReturnType<typeof useGenerateJobNoteWithAiQuery>;
export type GenerateJobNoteWithAiLazyQueryHookResult = ReturnType<typeof useGenerateJobNoteWithAiLazyQuery>;

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
export function useRewriteTextWithAiQuery(baseOptions: ApolloReactHooks.QueryHookOptions<RewriteTextWithAiQuery, RewriteTextWithAiQueryVariables> & ({ variables: RewriteTextWithAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RewriteTextWithAiQuery, RewriteTextWithAiQueryVariables>(RewriteTextWithAiDocument, options);
      }
export function useRewriteTextWithAiLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RewriteTextWithAiQuery, RewriteTextWithAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RewriteTextWithAiQuery, RewriteTextWithAiQueryVariables>(RewriteTextWithAiDocument, options);
        }

export type RewriteTextWithAiQueryHookResult = ReturnType<typeof useRewriteTextWithAiQuery>;
export type RewriteTextWithAiLazyQueryHookResult = ReturnType<typeof useRewriteTextWithAiLazyQuery>;

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
export function useRestructureJobDescriptionWithAiQuery(baseOptions: ApolloReactHooks.QueryHookOptions<RestructureJobDescriptionWithAiQuery, RestructureJobDescriptionWithAiQueryVariables> & ({ variables: RestructureJobDescriptionWithAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RestructureJobDescriptionWithAiQuery, RestructureJobDescriptionWithAiQueryVariables>(RestructureJobDescriptionWithAiDocument, options);
      }
export function useRestructureJobDescriptionWithAiLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RestructureJobDescriptionWithAiQuery, RestructureJobDescriptionWithAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RestructureJobDescriptionWithAiQuery, RestructureJobDescriptionWithAiQueryVariables>(RestructureJobDescriptionWithAiDocument, options);
        }

export type RestructureJobDescriptionWithAiQueryHookResult = ReturnType<typeof useRestructureJobDescriptionWithAiQuery>;
export type RestructureJobDescriptionWithAiLazyQueryHookResult = ReturnType<typeof useRestructureJobDescriptionWithAiLazyQuery>;

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
export function useGenerateJobLocationWithAiQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GenerateJobLocationWithAiQuery, GenerateJobLocationWithAiQueryVariables> & ({ variables: GenerateJobLocationWithAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GenerateJobLocationWithAiQuery, GenerateJobLocationWithAiQueryVariables>(GenerateJobLocationWithAiDocument, options);
      }
export function useGenerateJobLocationWithAiLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GenerateJobLocationWithAiQuery, GenerateJobLocationWithAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GenerateJobLocationWithAiQuery, GenerateJobLocationWithAiQueryVariables>(GenerateJobLocationWithAiDocument, options);
        }

export type GenerateJobLocationWithAiQueryHookResult = ReturnType<typeof useGenerateJobLocationWithAiQuery>;
export type GenerateJobLocationWithAiLazyQueryHookResult = ReturnType<typeof useGenerateJobLocationWithAiLazyQuery>;

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
export function useGenerateJobWorkRegionWithAiQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GenerateJobWorkRegionWithAiQuery, GenerateJobWorkRegionWithAiQueryVariables> & ({ variables: GenerateJobWorkRegionWithAiQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GenerateJobWorkRegionWithAiQuery, GenerateJobWorkRegionWithAiQueryVariables>(GenerateJobWorkRegionWithAiDocument, options);
      }
export function useGenerateJobWorkRegionWithAiLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GenerateJobWorkRegionWithAiQuery, GenerateJobWorkRegionWithAiQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GenerateJobWorkRegionWithAiQuery, GenerateJobWorkRegionWithAiQueryVariables>(GenerateJobWorkRegionWithAiDocument, options);
        }

export type GenerateJobWorkRegionWithAiQueryHookResult = ReturnType<typeof useGenerateJobWorkRegionWithAiQuery>;
export type GenerateJobWorkRegionWithAiLazyQueryHookResult = ReturnType<typeof useGenerateJobWorkRegionWithAiLazyQuery>;

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


/**
 * __useRequestJobSummaryMutation__
 *
 * To run a mutation, you first call `useRequestJobSummaryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestJobSummaryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestJobSummaryMutation, { data, loading, error }] = useRequestJobSummaryMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useRequestJobSummaryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RequestJobSummaryMutation, RequestJobSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RequestJobSummaryMutation, RequestJobSummaryMutationVariables>(RequestJobSummaryDocument, options);
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
export function useFillJobAutomaticallyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<FillJobAutomaticallyMutation, FillJobAutomaticallyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<FillJobAutomaticallyMutation, FillJobAutomaticallyMutationVariables>(FillJobAutomaticallyDocument, options);
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
export function useCreateDraftCaptureJobMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateDraftCaptureJobMutation, CreateDraftCaptureJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateDraftCaptureJobMutation, CreateDraftCaptureJobMutationVariables>(CreateDraftCaptureJobDocument, options);
      }


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

/**
 * __useJobSummaryStatusChangedSubscription__
 *
 * To run a query within a React component, call `useJobSummaryStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useJobSummaryStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobSummaryStatusChangedSubscription({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobSummaryStatusChangedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<JobSummaryStatusChangedSubscription, JobSummaryStatusChangedSubscriptionVariables> & ({ variables: JobSummaryStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<JobSummaryStatusChangedSubscription, JobSummaryStatusChangedSubscriptionVariables>(JobSummaryStatusChangedDocument, options);
      }
export type JobSummaryStatusChangedSubscriptionHookResult = ReturnType<typeof useJobSummaryStatusChangedSubscription>;

export const JobFillStatusChangedDocument = gql`
    subscription JobFillStatusChanged($jobId: ID!) {
  jobFillStatusChanged(jobId: $jobId) {
    jobId
    status
    error
  }
}
    `;

/**
 * __useJobFillStatusChangedSubscription__
 *
 * To run a query within a React component, call `useJobFillStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useJobFillStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobFillStatusChangedSubscription({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobFillStatusChangedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<JobFillStatusChangedSubscription, JobFillStatusChangedSubscriptionVariables> & ({ variables: JobFillStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<JobFillStatusChangedSubscription, JobFillStatusChangedSubscriptionVariables>(JobFillStatusChangedDocument, options);
      }
export type JobFillStatusChangedSubscriptionHookResult = ReturnType<typeof useJobFillStatusChangedSubscription>;

export const JobMatchStatusChangedDocument = gql`
    subscription JobMatchStatusChanged($jobId: ID!) {
  jobMatchStatusChanged(jobId: $jobId) {
    jobId
    matchId
    status
  }
}
    `;

/**
 * __useJobMatchStatusChangedSubscription__
 *
 * To run a query within a React component, call `useJobMatchStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useJobMatchStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobMatchStatusChangedSubscription({
 *   variables: {
 *      jobId: // value for 'jobId'
 *   },
 * });
 */
export function useJobMatchStatusChangedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<JobMatchStatusChangedSubscription, JobMatchStatusChangedSubscriptionVariables> & ({ variables: JobMatchStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<JobMatchStatusChangedSubscription, JobMatchStatusChangedSubscriptionVariables>(JobMatchStatusChangedDocument, options);
      }
export type JobMatchStatusChangedSubscriptionHookResult = ReturnType<typeof useJobMatchStatusChangedSubscription>;

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
export function useMatchAnalysesListQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MatchAnalysesListQuery, MatchAnalysesListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MatchAnalysesListQuery, MatchAnalysesListQueryVariables>(MatchAnalysesListDocument, options);
      }
export function useMatchAnalysesListLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MatchAnalysesListQuery, MatchAnalysesListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MatchAnalysesListQuery, MatchAnalysesListQueryVariables>(MatchAnalysesListDocument, options);
        }

export type MatchAnalysesListQueryHookResult = ReturnType<typeof useMatchAnalysesListQuery>;
export type MatchAnalysesListLazyQueryHookResult = ReturnType<typeof useMatchAnalysesListLazyQuery>;

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
export function useMatchQuery(baseOptions: ApolloReactHooks.QueryHookOptions<MatchQuery, MatchQueryVariables> & ({ variables: MatchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MatchQuery, MatchQueryVariables>(MatchDocument, options);
      }
export function useMatchLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MatchQuery, MatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MatchQuery, MatchQueryVariables>(MatchDocument, options);
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
export function useJobMatchQuery(baseOptions: ApolloReactHooks.QueryHookOptions<JobMatchQuery, JobMatchQueryVariables> & ({ variables: JobMatchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<JobMatchQuery, JobMatchQueryVariables>(JobMatchDocument, options);
      }
export function useJobMatchLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<JobMatchQuery, JobMatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<JobMatchQuery, JobMatchQueryVariables>(JobMatchDocument, options);
        }

export type JobMatchQueryHookResult = ReturnType<typeof useJobMatchQuery>;
export type JobMatchLazyQueryHookResult = ReturnType<typeof useJobMatchLazyQuery>;

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
export function useGenerateJobMatchMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<GenerateJobMatchMutation, GenerateJobMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<GenerateJobMatchMutation, GenerateJobMatchMutationVariables>(GenerateJobMatchDocument, options);
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
export function useDeleteMatchAnalysisMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteMatchAnalysisMutation, DeleteMatchAnalysisMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteMatchAnalysisMutation, DeleteMatchAnalysisMutationVariables>(DeleteMatchAnalysisDocument, options);
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
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }

export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;

export const QuickFilterCountsDocument = gql`
    query QuickFilterCounts($company: String, $runId: ID) {
  quickFilterCounts(company: $company, runId: $runId) {
    key
    count
  }
}
    `;

/**
 * __useQuickFilterCountsQuery__
 *
 * To run a query within a React component, call `useQuickFilterCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuickFilterCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuickFilterCountsQuery({
 *   variables: {
 *      company: // value for 'company'
 *      runId: // value for 'runId'
 *   },
 * });
 */
export function useQuickFilterCountsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<QuickFilterCountsQuery, QuickFilterCountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<QuickFilterCountsQuery, QuickFilterCountsQueryVariables>(QuickFilterCountsDocument, options);
      }
export function useQuickFilterCountsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<QuickFilterCountsQuery, QuickFilterCountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<QuickFilterCountsQuery, QuickFilterCountsQueryVariables>(QuickFilterCountsDocument, options);
        }

export type QuickFilterCountsQueryHookResult = ReturnType<typeof useQuickFilterCountsQuery>;
export type QuickFilterCountsLazyQueryHookResult = ReturnType<typeof useQuickFilterCountsLazyQuery>;

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
export function useResumesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ResumesQuery, ResumesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ResumesQuery, ResumesQueryVariables>(ResumesDocument, options);
      }
export function useResumesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ResumesQuery, ResumesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ResumesQuery, ResumesQueryVariables>(ResumesDocument, options);
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
export function useResumesForPickerQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ResumesForPickerQuery, ResumesForPickerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ResumesForPickerQuery, ResumesForPickerQueryVariables>(ResumesForPickerDocument, options);
      }
export function useResumesForPickerLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ResumesForPickerQuery, ResumesForPickerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ResumesForPickerQuery, ResumesForPickerQueryVariables>(ResumesForPickerDocument, options);
        }

export type ResumesForPickerQueryHookResult = ReturnType<typeof useResumesForPickerQuery>;
export type ResumesForPickerLazyQueryHookResult = ReturnType<typeof useResumesForPickerLazyQuery>;

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
export function useResumeQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ResumeQuery, ResumeQueryVariables> & ({ variables: ResumeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ResumeQuery, ResumeQueryVariables>(ResumeDocument, options);
      }
export function useResumeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ResumeQuery, ResumeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ResumeQuery, ResumeQueryVariables>(ResumeDocument, options);
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
export function useCreateResumeMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateResumeMutation, CreateResumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateResumeMutation, CreateResumeMutationVariables>(CreateResumeDocument, options);
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
export function useUpdateResumeMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateResumeMutation, UpdateResumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateResumeMutation, UpdateResumeMutationVariables>(UpdateResumeDocument, options);
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
export function useDeleteResumeMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteResumeMutation, DeleteResumeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteResumeMutation, DeleteResumeMutationVariables>(DeleteResumeDocument, options);
      }


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
export function useSettingsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SettingsQuery, SettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SettingsQuery, SettingsQueryVariables>(SettingsDocument, options);
      }
export function useSettingsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SettingsQuery, SettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SettingsQuery, SettingsQueryVariables>(SettingsDocument, options);
        }

export type SettingsQueryHookResult = ReturnType<typeof useSettingsQuery>;
export type SettingsLazyQueryHookResult = ReturnType<typeof useSettingsLazyQuery>;

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
export function useUpdateSettingsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateSettingsMutation, UpdateSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateSettingsMutation, UpdateSettingsMutationVariables>(UpdateSettingsDocument, options);
      }


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


/**
 * __useSaveOpenAiKeyMutation__
 *
 * To run a mutation, you first call `useSaveOpenAiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveOpenAiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveOpenAiKeyMutation, { data, loading, error }] = useSaveOpenAiKeyMutation({
 *   variables: {
 *      key: // value for 'key'
 *   },
 * });
 */
export function useSaveOpenAiKeyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveOpenAiKeyMutation, SaveOpenAiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveOpenAiKeyMutation, SaveOpenAiKeyMutationVariables>(SaveOpenAiKeyDocument, options);
      }


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


/**
 * __useRemoveOpenAiKeyMutation__
 *
 * To run a mutation, you first call `useRemoveOpenAiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveOpenAiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeOpenAiKeyMutation, { data, loading, error }] = useRemoveOpenAiKeyMutation({
 *   variables: {
 *   },
 * });
 */
export function useRemoveOpenAiKeyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveOpenAiKeyMutation, RemoveOpenAiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RemoveOpenAiKeyMutation, RemoveOpenAiKeyMutationVariables>(RemoveOpenAiKeyDocument, options);
      }


export const AiUsageChangedDocument = gql`
    subscription AiUsageChanged {
  aiUsageChanged {
    trialCallsUsed
    hasOpenAiKey
  }
}
    `;

/**
 * __useAiUsageChangedSubscription__
 *
 * To run a query within a React component, call `useAiUsageChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAiUsageChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAiUsageChangedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAiUsageChangedSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<AiUsageChangedSubscription, AiUsageChangedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<AiUsageChangedSubscription, AiUsageChangedSubscriptionVariables>(AiUsageChangedDocument, options);
      }
export type AiUsageChangedSubscriptionHookResult = ReturnType<typeof useAiUsageChangedSubscription>;

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


/**
 * __useRerunSourceTemplateMutation__
 *
 * To run a mutation, you first call `useRerunSourceTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRerunSourceTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rerunSourceTemplateMutation, { data, loading, error }] = useRerunSourceTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useRerunSourceTemplateMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RerunSourceTemplateMutation, RerunSourceTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RerunSourceTemplateMutation, RerunSourceTemplateMutationVariables>(RerunSourceTemplateDocument, options);
      }


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

/**
 * __useSourceRunEventsSubscription__
 *
 * To run a query within a React component, call `useSourceRunEventsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSourceRunEventsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceRunEventsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSourceRunEventsSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<SourceRunEventsSubscription, SourceRunEventsSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<SourceRunEventsSubscription, SourceRunEventsSubscriptionVariables>(SourceRunEventsDocument, options);
      }
export type SourceRunEventsSubscriptionHookResult = ReturnType<typeof useSourceRunEventsSubscription>;

export const ClearSourceTemplateRunsDocument = gql`
    mutation ClearSourceTemplateRuns($templateId: ID!, $deleteJobs: Boolean = false) {
  clearSourceTemplateRuns(templateId: $templateId, deleteJobs: $deleteJobs)
}
    `;


/**
 * __useClearSourceTemplateRunsMutation__
 *
 * To run a mutation, you first call `useClearSourceTemplateRunsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearSourceTemplateRunsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearSourceTemplateRunsMutation, { data, loading, error }] = useClearSourceTemplateRunsMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      deleteJobs: // value for 'deleteJobs'
 *   },
 * });
 */
export function useClearSourceTemplateRunsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ClearSourceTemplateRunsMutation, ClearSourceTemplateRunsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ClearSourceTemplateRunsMutation, ClearSourceTemplateRunsMutationVariables>(ClearSourceTemplateRunsDocument, options);
      }


export const DeleteSourceRunDocument = gql`
    mutation DeleteSourceRun($id: ID!, $deleteJobs: Boolean = false) {
  deleteSourceRun(id: $id, deleteJobs: $deleteJobs) {
    success
    deletedId
  }
}
    `;


/**
 * __useDeleteSourceRunMutation__
 *
 * To run a mutation, you first call `useDeleteSourceRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSourceRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSourceRunMutation, { data, loading, error }] = useDeleteSourceRunMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deleteJobs: // value for 'deleteJobs'
 *   },
 * });
 */
export function useDeleteSourceRunMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteSourceRunMutation, DeleteSourceRunMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteSourceRunMutation, DeleteSourceRunMutationVariables>(DeleteSourceRunDocument, options);
      }


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

/**
 * __useSourceTemplateQuery__
 *
 * To run a query within a React component, call `useSourceTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourceTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceTemplateQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSourceTemplateQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SourceTemplateQuery, SourceTemplateQueryVariables> & ({ variables: SourceTemplateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SourceTemplateQuery, SourceTemplateQueryVariables>(SourceTemplateDocument, options);
      }
export function useSourceTemplateLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SourceTemplateQuery, SourceTemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SourceTemplateQuery, SourceTemplateQueryVariables>(SourceTemplateDocument, options);
        }

export type SourceTemplateQueryHookResult = ReturnType<typeof useSourceTemplateQuery>;
export type SourceTemplateLazyQueryHookResult = ReturnType<typeof useSourceTemplateLazyQuery>;

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

/**
 * __useSourceTemplatesAllQuery__
 *
 * To run a query within a React component, call `useSourceTemplatesAllQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourceTemplatesAllQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceTemplatesAllQuery({
 *   variables: {
 *   },
 * });
 */
export function useSourceTemplatesAllQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SourceTemplatesAllQuery, SourceTemplatesAllQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SourceTemplatesAllQuery, SourceTemplatesAllQueryVariables>(SourceTemplatesAllDocument, options);
      }
export function useSourceTemplatesAllLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SourceTemplatesAllQuery, SourceTemplatesAllQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SourceTemplatesAllQuery, SourceTemplatesAllQueryVariables>(SourceTemplatesAllDocument, options);
        }

export type SourceTemplatesAllQueryHookResult = ReturnType<typeof useSourceTemplatesAllQuery>;
export type SourceTemplatesAllLazyQueryHookResult = ReturnType<typeof useSourceTemplatesAllLazyQuery>;

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
export function useUpdateSourceTemplateMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateSourceTemplateMutation, UpdateSourceTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateSourceTemplateMutation, UpdateSourceTemplateMutationVariables>(UpdateSourceTemplateDocument, options);
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
export function useDeleteSourceTemplateMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteSourceTemplateMutation, DeleteSourceTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteSourceTemplateMutation, DeleteSourceTemplateMutationVariables>(DeleteSourceTemplateDocument, options);
      }


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
export function useCreateSourceTemplateMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateSourceTemplateMutation, CreateSourceTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateSourceTemplateMutation, CreateSourceTemplateMutationVariables>(CreateSourceTemplateDocument, options);
      }


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

/**
 * __usePlansQuery__
 *
 * To run a query within a React component, call `usePlansQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlansQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlansQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<PlansQuery, PlansQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PlansQuery, PlansQueryVariables>(PlansDocument, options);
      }
export function usePlansLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlansQuery, PlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlansQuery, PlansQueryVariables>(PlansDocument, options);
        }

export type PlansQueryHookResult = ReturnType<typeof usePlansQuery>;
export type PlansLazyQueryHookResult = ReturnType<typeof usePlansLazyQuery>;

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

/**
 * __useSourceRunActivityEventsQuery__
 *
 * To run a query within a React component, call `useSourceRunActivityEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSourceRunActivityEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceRunActivityEventsQuery({
 *   variables: {
 *      runId: // value for 'runId'
 *   },
 * });
 */
export function useSourceRunActivityEventsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SourceRunActivityEventsQuery, SourceRunActivityEventsQueryVariables> & ({ variables: SourceRunActivityEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SourceRunActivityEventsQuery, SourceRunActivityEventsQueryVariables>(SourceRunActivityEventsDocument, options);
      }
export function useSourceRunActivityEventsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SourceRunActivityEventsQuery, SourceRunActivityEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SourceRunActivityEventsQuery, SourceRunActivityEventsQueryVariables>(SourceRunActivityEventsDocument, options);
        }

export type SourceRunActivityEventsQueryHookResult = ReturnType<typeof useSourceRunActivityEventsQuery>;
export type SourceRunActivityEventsLazyQueryHookResult = ReturnType<typeof useSourceRunActivityEventsLazyQuery>;

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

/**
 * __useSourceRunActivityEventsLiveSubscription__
 *
 * To run a query within a React component, call `useSourceRunActivityEventsLiveSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSourceRunActivityEventsLiveSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSourceRunActivityEventsLiveSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSourceRunActivityEventsLiveSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<SourceRunActivityEventsLiveSubscription, SourceRunActivityEventsLiveSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<SourceRunActivityEventsLiveSubscription, SourceRunActivityEventsLiveSubscriptionVariables>(SourceRunActivityEventsLiveDocument, options);
      }
export type SourceRunActivityEventsLiveSubscriptionHookResult = ReturnType<typeof useSourceRunActivityEventsLiveSubscription>;

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

/**
 * __usePlanQuery__
 *
 * To run a query within a React component, call `usePlanQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePlanQuery(baseOptions: ApolloReactHooks.QueryHookOptions<PlanQuery, PlanQueryVariables> & ({ variables: PlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PlanQuery, PlanQueryVariables>(PlanDocument, options);
      }
export function usePlanLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlanQuery, PlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlanQuery, PlanQueryVariables>(PlanDocument, options);
        }

export type PlanQueryHookResult = ReturnType<typeof usePlanQuery>;
export type PlanLazyQueryHookResult = ReturnType<typeof usePlanLazyQuery>;

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


/**
 * __useUpdatePlanMutation__
 *
 * To run a mutation, you first call `useUpdatePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlanMutation, { data, loading, error }] = useUpdatePlanMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePlanMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePlanMutation, UpdatePlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePlanMutation, UpdatePlanMutationVariables>(UpdatePlanDocument, options);
      }


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


/**
 * __useCreatePlanMutation__
 *
 * To run a mutation, you first call `useCreatePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPlanMutation, { data, loading, error }] = useCreatePlanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePlanMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreatePlanMutation, CreatePlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreatePlanMutation, CreatePlanMutationVariables>(CreatePlanDocument, options);
      }


export const TourProgressDocument = gql`
    query TourProgress($tourId: String!) {
  tourProgress(tourId: $tourId) {
    id
    tourId
    tourVersion
    status
    currentStepId
  }
}
    `;

/**
 * __useTourProgressQuery__
 *
 * To run a query within a React component, call `useTourProgressQuery` and pass it any options that fit your needs.
 * When your component renders, `useTourProgressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTourProgressQuery({
 *   variables: {
 *      tourId: // value for 'tourId'
 *   },
 * });
 */
export function useTourProgressQuery(baseOptions: ApolloReactHooks.QueryHookOptions<TourProgressQuery, TourProgressQueryVariables> & ({ variables: TourProgressQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<TourProgressQuery, TourProgressQueryVariables>(TourProgressDocument, options);
      }
export function useTourProgressLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<TourProgressQuery, TourProgressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<TourProgressQuery, TourProgressQueryVariables>(TourProgressDocument, options);
        }

export type TourProgressQueryHookResult = ReturnType<typeof useTourProgressQuery>;
export type TourProgressLazyQueryHookResult = ReturnType<typeof useTourProgressLazyQuery>;

export const SaveTourProgressDocument = gql`
    mutation SaveTourProgress($input: SaveTourProgressInput!) {
  saveTourProgress(input: $input) {
    id
    tourId
    tourVersion
    status
    currentStepId
  }
}
    `;


/**
 * __useSaveTourProgressMutation__
 *
 * To run a mutation, you first call `useSaveTourProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveTourProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveTourProgressMutation, { data, loading, error }] = useSaveTourProgressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSaveTourProgressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveTourProgressMutation, SaveTourProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveTourProgressMutation, SaveTourProgressMutationVariables>(SaveTourProgressDocument, options);
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
export function useWorkPreferencesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<WorkPreferencesQuery, WorkPreferencesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WorkPreferencesQuery, WorkPreferencesQueryVariables>(WorkPreferencesDocument, options);
      }
export function useWorkPreferencesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WorkPreferencesQuery, WorkPreferencesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WorkPreferencesQuery, WorkPreferencesQueryVariables>(WorkPreferencesDocument, options);
        }

export type WorkPreferencesQueryHookResult = ReturnType<typeof useWorkPreferencesQuery>;
export type WorkPreferencesLazyQueryHookResult = ReturnType<typeof useWorkPreferencesLazyQuery>;

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
export function useUpdateWorkPreferencesMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateWorkPreferencesMutation, UpdateWorkPreferencesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateWorkPreferencesMutation, UpdateWorkPreferencesMutationVariables>(UpdateWorkPreferencesDocument, options);
      }

