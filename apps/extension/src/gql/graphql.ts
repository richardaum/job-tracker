/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
};

export enum ApplicationQuickFilter {
  Active = "Active",
  Applied = "Applied",
  Draft = "Draft",
  Duplicated = "Duplicated",
  Incoming = "Incoming",
  New = "New",
  Rejected = "Rejected",
}

export enum ApplicationStage {
  Applied = "Applied",
  CulturalFit = "CulturalFit",
  Draft = "Draft",
  Duplicated = "Duplicated",
  New = "New",
  Offer = "Offer",
  RecruiterScreen = "RecruiterScreen",
  Rejected = "Rejected",
  Technical = "Technical",
}

export enum AsyncMetadataStatus {
  Completed = "Completed",
  Failed = "Failed",
  Processing = "Processing",
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
  Google = "Google",
}

export type BlockedKeyword = {
  __typename?: "BlockedKeyword";
  keyword: Scalars["String"]["output"];
  matchMode: MatchMode;
  scope: KeywordScope;
};

export type BlockedKeywordInput = { keyword: Scalars["String"]["input"]; matchMode: MatchMode; scope: KeywordScope };

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
  autoFill?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoMatch?: InputMaybe<Scalars["Boolean"]["input"]>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  createAsDraftCapture?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  htmlContent?: InputMaybe<Scalars["String"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
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

export type CreateNoteInput = { content: Scalars["String"]["input"]; jobId: Scalars["String"]["input"] };

export type CreatePlanInput = { displayName: Scalars["String"]["input"]; document: Scalars["JSON"]["input"] };

export type CreateResumeInput = {
  content: Scalars["String"]["input"];
  isDefault?: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
};

export type CreateSourceRunInput = { planId: Scalars["ID"]["input"] };

export type CreateSourceTemplateInput = {
  config?: InputMaybe<Scalars["JSON"]["input"]>;
  planId: Scalars["ID"]["input"];
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

export type ExtensionActivityEvent = {
  __typename?: "ExtensionActivityEvent";
  /** Browser user-agent or name. */
  browser?: Maybe<Scalars["String"]["output"]>;
  /** Extension version that reported the event. */
  extensionVersion?: Maybe<Scalars["String"]["output"]>;
  /** Unique event identifier. */
  id: Scalars["ID"]["output"];
  /** When the event actually happened (client-reported). */
  occurredAt: Scalars["DateTime"]["output"];
  /** Arbitrary JSON payload with event details. */
  payload?: Maybe<Scalars["JSON"]["output"]>;
  /** Groups related events (e.g. run ID). */
  sourceRunId?: Maybe<Scalars["String"]["output"]>;
  /** Human-readable summary of what happened. */
  summary: Scalars["String"]["output"];
  /** Event category (source run lifecycle, import, auth). */
  type: ExtensionActivityEventType;
};

export enum ExtensionActivityEventType {
  AuthFailed = "AuthFailed",
  AuthRefreshed = "AuthRefreshed",
  ImportJobCompleted = "ImportJobCompleted",
  ImportJobFailed = "ImportJobFailed",
  ImportJobStarted = "ImportJobStarted",
  SourceRunClaimSkipped = "SourceRunClaimSkipped",
  SourceRunCompleted = "SourceRunCompleted",
  SourceRunFailed = "SourceRunFailed",
  SourceRunJobDetailsImport = "SourceRunJobDetailsImport",
  SourceRunJobSkipped = "SourceRunJobSkipped",
  SourceRunJobSurfaceImport = "SourceRunJobSurfaceImport",
  SourceRunPageCollected = "SourceRunPageCollected",
  SourceRunReceived = "SourceRunReceived",
  SourceRunStarted = "SourceRunStarted",
  SourceRunStopConditionMet = "SourceRunStopConditionMet",
}

export enum FitClassification {
  Negative = "Negative",
  Neutral = "Neutral",
  Positive = "Positive",
}

export type GenerateMatchInput = { jobId: Scalars["ID"]["input"]; resumeId: Scalars["ID"]["input"] };

export type JobFillStatusEventType = {
  __typename?: "JobFillStatusEventType";
  error?: Maybe<Scalars["String"]["output"]>;
  jobId: Scalars["ID"]["output"];
  status: Scalars["String"]["output"];
};

export type JobMatchStatusEventType = {
  __typename?: "JobMatchStatusEventType";
  jobId: Scalars["ID"]["output"];
  matchId: Scalars["ID"]["output"];
  status: Scalars["String"]["output"];
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
  Jack = "Jack",
  Linkedin = "Linkedin",
  RemoteYeah = "RemoteYeah",
  Wellfound = "Wellfound",
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

export type JobSummaryStatusEventType = {
  __typename?: "JobSummaryStatusEventType";
  jobId: Scalars["ID"]["output"];
  status: Scalars["String"]["output"];
  summary?: Maybe<Scalars["String"]["output"]>;
  summaryMetadata?: Maybe<AsyncMetadataType>;
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
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
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

export enum KeywordScope {
  Company = "Company",
  Description = "Description",
  Title = "Title",
}

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
  id: Scalars["ID"]["output"];
  jdQuote: Scalars["String"]["output"];
  requirement: Scalars["String"]["output"];
  source: MatchSource;
  sourceQuotes: Array<Scalars["String"]["output"]>;
  suggestion?: Maybe<Scalars["String"]["output"]>;
  type: RequirementType;
  verdict: MatchVerdict;
  weight?: Maybe<Weight>;
};

export enum MatchMode {
  Exact = "Exact",
  Partial = "Partial",
}

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
  clearSourceRuns: Scalars["Boolean"]["output"];
  clearSourceTemplateRuns: Scalars["Int"]["output"];
  createJob: JobType;
  createJobNote: NoteType;
  createJobStageEvent: JobStageEventType;
  createPlan: PlanType;
  createResume: ResumeType;
  createSourceRun: SourceRunType;
  createSourceTemplate: SourceTemplateType;
  deactivateAccount: Scalars["Boolean"]["output"];
  deleteCompany: DeleteMutationPayloadType;
  deleteJob: DeleteMutationPayloadType;
  deleteJobNote: DeleteMutationPayloadType;
  deleteJobStageEvent: DeleteMutationPayloadType;
  deleteMatchAnalysis: DeleteMutationPayloadType;
  deletePlan: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  deleteSourceTemplate: DeleteMutationPayloadType;
  detachJobsFromSourceRun: Scalars["Int"]["output"];
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
  updatePlan: PlanType;
  updateResume: ResumeType;
  updateSettings: UserSetting;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateSourceTemplate: SourceTemplateType;
  updateWorkPreferences: Array<PreferenceType>;
};

export type MutationClearSourceTemplateRunsArgs = {
  deleteJobs?: InputMaybe<Scalars["Boolean"]["input"]>;
  templateId: Scalars["ID"]["input"];
};

export type MutationCreateJobArgs = { input: CreateJobInput };

export type MutationCreateJobNoteArgs = { input: CreateNoteInput };

export type MutationCreateJobStageEventArgs = { input: CreateJobStageEventInput };

export type MutationCreatePlanArgs = { input: CreatePlanInput };

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationCreateSourceRunArgs = { input: CreateSourceRunInput };

export type MutationCreateSourceTemplateArgs = { input: CreateSourceTemplateInput };

export type MutationDeleteCompanyArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobNoteArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteJobStageEventArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteMatchAnalysisArgs = { id: Scalars["ID"]["input"] };

export type MutationDeletePlanArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteResumeArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceRunArgs = {
  deleteJobs?: InputMaybe<Scalars["Boolean"]["input"]>;
  id: Scalars["ID"]["input"];
};

export type MutationDeleteSourceTemplateArgs = { id: Scalars["ID"]["input"] };

export type MutationDetachJobsFromSourceRunArgs = { sourceRunId: Scalars["ID"]["input"] };

export type MutationFillJobAutomaticallyArgs = { jobId: Scalars["ID"]["input"] };

export type MutationGenerateJobMatchArgs = { input: GenerateMatchInput };

export type MutationRemoveJobTagArgs = { id: Scalars["ID"]["input"]; tag: Scalars["String"]["input"] };

export type MutationReportExtensionActivityArgs = { input: ReportExtensionActivityInput };

export type MutationRequestJobSummaryArgs = { jobId: Scalars["ID"]["input"] };

export type MutationRerunSourceTemplateArgs = { templateId: Scalars["ID"]["input"] };

export type MutationUpdateCompanyArgs = { id: Scalars["ID"]["input"]; input: UpdateCompanyInput };

export type MutationUpdateJobArgs = { id: Scalars["ID"]["input"]; input: UpdateJobInput };

export type MutationUpdateJobNoteArgs = { id: Scalars["ID"]["input"]; input: UpdateNoteInput };

export type MutationUpdateJobStageEventArgs = { id: Scalars["ID"]["input"]; input: UpdateJobStageEventInput };

export type MutationUpdatePlanArgs = { id: Scalars["ID"]["input"]; input: UpdatePlanInput };

export type MutationUpdateResumeArgs = { id: Scalars["ID"]["input"]; input: UpdateResumeInput };

export type MutationUpdateSettingsArgs = { input: UpdateSettingsInput };

export type MutationUpdateSourceRunArgs = { id: Scalars["ID"]["input"]; input: UpdateSourceRunInput };

export type MutationUpdateSourceRunStatusArgs = {
  errorMessage?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  status: SourceRunStatus;
};

export type MutationUpdateSourceTemplateArgs = { id: Scalars["ID"]["input"]; input: UpdateSourceTemplateInput };

export type MutationUpdateWorkPreferencesArgs = { items: Array<PreferenceInput> };

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

export type PlanType = {
  __typename?: "PlanType";
  createdAt: Scalars["DateTime"]["output"];
  displayName: Scalars["String"]["output"];
  document: Scalars["JSON"]["output"];
  id: Scalars["ID"]["output"];
  templates: Array<SourceTemplateType>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type PreferenceInput = { text: Scalars["String"]["input"]; weight: Weight };

export type PreferenceType = { __typename?: "PreferenceType"; text: Scalars["String"]["output"]; weight: Weight };

export type Query = {
  __typename?: "Query";
  companies: Array<CompanyType>;
  company: CompanyType;
  companyJobsCount: Scalars["Int"]["output"];
  exchangeRates: CurrencyRates;
  extensionActivityEvents: Array<ExtensionActivityEvent>;
  generateCompanyDescription: Scalars["String"]["output"];
  generateJobLocationWithAI?: Maybe<Scalars["String"]["output"]>;
  generateJobNoteWithAI: Scalars["String"]["output"];
  generateJobWorkRegionWithAI?: Maybe<Scalars["String"]["output"]>;
  isJobDuplicate: Scalars["Boolean"]["output"];
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
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars["String"]["output"];
  settings: UserSetting;
  sourceRunActivityEvents: Array<SourceRunActivityEvent>;
  sourceRuns: Array<SourceRunType>;
  sourceTemplate: SourceTemplateType;
  sourceTemplates: Array<SourceTemplateType>;
  users: Array<UserType>;
  workPreferences: Array<PreferenceType>;
};

export type QueryCompanyArgs = { id: Scalars["ID"]["input"] };

export type QueryCompanyJobsCountArgs = { id: Scalars["ID"]["input"] };

export type QueryExchangeRatesArgs = {
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]>;
};

export type QueryExtensionActivityEventsArgs = { limit?: InputMaybe<Scalars["Int"]["input"]> };

export type QueryGenerateCompanyDescriptionArgs = { companyName: Scalars["String"]["input"] };

export type QueryGenerateJobLocationWithAiArgs = { jobId: Scalars["ID"]["input"] };

export type QueryGenerateJobNoteWithAiArgs = { jobId: Scalars["ID"]["input"]; note: Scalars["String"]["input"] };

export type QueryGenerateJobWorkRegionWithAiArgs = { jobId: Scalars["ID"]["input"] };

export type QueryIsJobDuplicateArgs = { company: Scalars["String"]["input"]; title: Scalars["String"]["input"] };

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

export type QueryPlanArgs = { id: Scalars["ID"]["input"] };

export type QueryRestructureJobDescriptionWithAiArgs = { text: Scalars["String"]["input"] };

export type QueryResumeArgs = { id: Scalars["ID"]["input"] };

export type QueryRewriteTextWithAiArgs = { text: Scalars["String"]["input"] };

export type QuerySourceRunActivityEventsArgs = { runId: Scalars["ID"]["input"] };

export type QuerySourceTemplateArgs = { id: Scalars["ID"]["input"] };

export type ReportExtensionActivityInput = {
  browser?: InputMaybe<Scalars["String"]["input"]>;
  extensionVersion?: InputMaybe<Scalars["String"]["input"]>;
  occurredAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  payload?: InputMaybe<Scalars["JSON"]["input"]>;
  sourceRunId?: InputMaybe<Scalars["String"]["input"]>;
  summary: Scalars["String"]["input"];
  type: ExtensionActivityEventType;
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
  Hour = "Hour",
  Month = "Month",
  Year = "Year",
}

export type SourceRunActivityEvent = {
  __typename?: "SourceRunActivityEvent";
  occurredAt: Scalars["DateTime"]["output"];
  payload?: Maybe<Scalars["JSON"]["output"]>;
  summary: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
};

export type SourceRunEvent = {
  __typename?: "SourceRunEvent";
  occurredAt: Scalars["DateTime"]["output"];
  run: SourceRunType;
  type: SourceRunEventType;
};

export enum SourceRunEventType {
  SourceRunCreated = "SourceRunCreated",
  SourceRunStatusChanged = "SourceRunStatusChanged",
}

export enum SourceRunStatus {
  Completed = "Completed",
  Failed = "Failed",
  Pending = "Pending",
}

export type SourceRunType = {
  __typename?: "SourceRunType";
  catchUpThreshold?: Maybe<Scalars["Int"]["output"]>;
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  jobCount: Scalars["Int"]["output"];
  maxPages?: Maybe<Scalars["Int"]["output"]>;
  olderThanDays?: Maybe<Scalars["Int"]["output"]>;
  planId: Scalars["ID"]["output"];
  startedAt: Scalars["DateTime"]["output"];
  status: SourceRunStatus;
  stopWhen?: Maybe<StopWhen>;
  surfaceUrl: Scalars["String"]["output"];
  templateId: Scalars["ID"]["output"];
};

export type SourceTemplateType = {
  __typename?: "SourceTemplateType";
  config?: Maybe<Scalars["JSON"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  plan: PlanType;
  planId: Scalars["ID"]["output"];
  runs: Array<SourceRunType>;
  scheduleCron?: Maybe<Scalars["String"]["output"]>;
  scheduleEnabled: Scalars["Boolean"]["output"];
  surfaceUrl: Scalars["String"]["output"];
};

export enum StageEventSource {
  Manual = "Manual",
  System = "System",
}

export enum StopWhen {
  CatchUp = "CatchUp",
  FirstRunMaxPages = "FirstRunMaxPages",
  OlderThan = "OlderThan",
}

export type Subscription = {
  __typename?: "Subscription";
  extensionActivityEvents: ExtensionActivityEvent;
  jobFillStatusChanged: JobFillStatusEventType;
  jobMatchStatusChanged: JobMatchStatusEventType;
  jobSummaryStatusChanged: JobSummaryStatusEventType;
  sourceRunEvents: SourceRunEvent;
};

export type SubscriptionJobFillStatusChangedArgs = { jobId: Scalars["ID"]["input"] };

export type SubscriptionJobMatchStatusChangedArgs = { jobId: Scalars["ID"]["input"] };

export type SubscriptionJobSummaryStatusChangedArgs = { jobId: Scalars["ID"]["input"] };

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

export type UpdatePlanInput = {
  displayName?: InputMaybe<Scalars["String"]["input"]>;
  document?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type UpdateResumeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  isDefault?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSettingsInput = {
  autoFillEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoMatchEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  autoSummaryEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  blockedCompanies?: InputMaybe<Array<Scalars["String"]["input"]>>;
  blockedKeywords?: InputMaybe<Array<BlockedKeywordInput>>;
  duplicateWindowDays?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateSourceRunInput = { surfaceUrl: Scalars["String"]["input"] };

export type UpdateSourceTemplateInput = {
  config?: InputMaybe<Scalars["JSON"]["input"]>;
  scheduleCron?: InputMaybe<Scalars["String"]["input"]>;
  scheduleEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  surfaceUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserSetting = {
  __typename?: "UserSetting";
  autoFillEnabled: Scalars["Boolean"]["output"];
  autoMatchEnabled: Scalars["Boolean"]["output"];
  autoSummaryEnabled: Scalars["Boolean"]["output"];
  blockedCompanies?: Maybe<Array<Scalars["String"]["output"]>>;
  blockedKeywords?: Maybe<Array<BlockedKeyword>>;
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
  High = "High",
  Low = "Low",
}

export type CreateDraftCaptureJobMutationVariables = Exact<{ input: CreateJobInput }>;

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

export type CreateJobMutationVariables = Exact<{ input: CreateJobInput }>;

export type CreateJobMutation = {
  __typename?: "Mutation";
  createJob: { __typename?: "JobType"; id: string; title?: string | null };
};

export type IsJobDuplicateQueryVariables = Exact<{
  company: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
}>;

export type IsJobDuplicateQuery = { __typename?: "Query"; isJobDuplicate: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: "Query"; me: { __typename?: "UserType"; email: string } };

export type PlanQueryVariables = Exact<{ id: Scalars["ID"]["input"] }>;

export type PlanQuery = {
  __typename?: "Query";
  plan?: { __typename?: "PlanType"; id: string; displayName: string; document: any } | null;
};

export type ReportExtensionActivityMutationVariables = Exact<{ input: ReportExtensionActivityInput }>;

export type ReportExtensionActivityMutation = {
  __typename?: "Mutation";
  reportExtensionActivity: {
    __typename?: "ExtensionActivityEvent";
    id: string;
    type: ExtensionActivityEventType;
    summary: string;
    sourceRunId?: string | null;
    occurredAt: any;
  };
};

export type SourceRunsQueryVariables = Exact<{ [key: string]: never }>;

export type SourceRunsQuery = {
  __typename?: "Query";
  sourceRuns: Array<{
    __typename?: "SourceRunType";
    id: string;
    templateId: string;
    planId: string;
    surfaceUrl: string;
    status: SourceRunStatus;
    errorMessage?: string | null;
    startedAt: any;
    stopWhen?: StopWhen | null;
    catchUpThreshold?: number | null;
    maxPages?: number | null;
    olderThanDays?: number | null;
  }>;
};

export type UpdateSourceRunStatusMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  status: SourceRunStatus;
  errorMessage?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type UpdateSourceRunStatusMutation = {
  __typename?: "Mutation";
  updateSourceRunStatus: {
    __typename?: "SourceRunType";
    id: string;
    status: SourceRunStatus;
    errorMessage?: string | null;
  };
};

export type UpdateSourceRunMutationVariables = Exact<{ id: Scalars["ID"]["input"]; input: UpdateSourceRunInput }>;

export type UpdateSourceRunMutation = {
  __typename?: "Mutation";
  updateSourceRun: { __typename?: "SourceRunType"; id: string; surfaceUrl: string };
};

export const CreateDraftCaptureJobDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateDraftCaptureJob" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "CreateJobInput" } } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "urls" } },
                { kind: "Field", name: { kind: "Name", value: "htmlContent" } },
                { kind: "Field", name: { kind: "Name", value: "currentStage" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fillMetadata" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
                      { kind: "Field", name: { kind: "Name", value: "timestamp" } },
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
} as unknown as DocumentNode<CreateDraftCaptureJobMutation, CreateDraftCaptureJobMutationVariables>;
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
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "CreateJobInput" } } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
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
} as unknown as DocumentNode<CreateJobMutation, CreateJobMutationVariables>;
export const IsJobDuplicateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "IsJobDuplicate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "company" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "isJobDuplicate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "company" },
                value: { kind: "Variable", name: { kind: "Name", value: "company" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: { kind: "Variable", name: { kind: "Name", value: "title" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IsJobDuplicateQuery, IsJobDuplicateQueryVariables>;
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
              selections: [{ kind: "Field", name: { kind: "Name", value: "email" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const PlanDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Plan" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "plan" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
                { kind: "Field", name: { kind: "Name", value: "document" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlanQuery, PlanQueryVariables>;
export const ReportExtensionActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReportExtensionActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ReportExtensionActivityInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reportExtensionActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "summary" } },
                { kind: "Field", name: { kind: "Name", value: "sourceRunId" } },
                { kind: "Field", name: { kind: "Name", value: "occurredAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReportExtensionActivityMutation, ReportExtensionActivityMutationVariables>;
export const SourceRunsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SourceRuns" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sourceRuns" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "templateId" } },
                { kind: "Field", name: { kind: "Name", value: "planId" } },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "errorMessage" } },
                { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                { kind: "Field", name: { kind: "Name", value: "stopWhen" } },
                { kind: "Field", name: { kind: "Name", value: "catchUpThreshold" } },
                { kind: "Field", name: { kind: "Name", value: "maxPages" } },
                { kind: "Field", name: { kind: "Name", value: "olderThanDays" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SourceRunsQuery, SourceRunsQueryVariables>;
export const UpdateSourceRunStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSourceRunStatus" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "status" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "SourceRunStatus" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "errorMessage" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSourceRunStatus" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: { kind: "Variable", name: { kind: "Name", value: "status" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "errorMessage" },
                value: { kind: "Variable", name: { kind: "Name", value: "errorMessage" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "errorMessage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSourceRunStatusMutation, UpdateSourceRunStatusMutationVariables>;
export const UpdateSourceRunDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateSourceRun" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UpdateSourceRunInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateSourceRun" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSourceRunMutation, UpdateSourceRunMutationVariables>;
