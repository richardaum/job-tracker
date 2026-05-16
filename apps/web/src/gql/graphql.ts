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
  generatedAt?: Maybe<Scalars["String"]["output"]>;
  status: AsyncMetadataStatus;
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
} & { " $fragmentName"?: "ApplicationSalarySelectionFragment" };

export type ApplicationsQueryVariables = Exact<{
  filter?: InputMaybe<ApplicationQuickFilter>;
  company?: InputMaybe<Scalars["String"]["input"]>;
  runId?: InputMaybe<Scalars["ID"]["input"]>;
}>;

export type ApplicationsQuery = {
  __typename?: "Query";
  applications: Array<
    {
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
        generatedAt?: string | null;
      } | null;
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
    } & {
      " $fragmentRefs"?: {
        ApplicationSalarySelectionFragment: ApplicationSalarySelectionFragment;
      };
    }
  >;
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
      generatedAt?: string | null;
    } | null;
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
  } & {
    " $fragmentRefs"?: {
      ApplicationSalarySelectionFragment: ApplicationSalarySelectionFragment;
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
  } & {
    " $fragmentRefs"?: {
      ApplicationSalarySelectionFragment: ApplicationSalarySelectionFragment;
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
      generatedAt?: string | null;
    } | null;
  } & {
    " $fragmentRefs"?: {
      ApplicationSalarySelectionFragment: ApplicationSalarySelectionFragment;
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
      generatedAt?: string | null;
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

export const ApplicationSalarySelectionFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ApplicationSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ApplicationType" },
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
} as unknown as DocumentNode<ApplicationSalarySelectionFragment, unknown>;
export const ApplicationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Applications" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "filter" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ApplicationQuickFilter" },
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
            name: { kind: "Name", value: "applications" },
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
                  name: { kind: "Name", value: "ApplicationSalarySelection" },
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
                        name: { kind: "Name", value: "generatedAt" },
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
                  name: { kind: "Name", value: "fit" },
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
                        name: { kind: "Name", value: "fitCount" },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ApplicationSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ApplicationType" },
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
} as unknown as DocumentNode<ApplicationsQuery, ApplicationsQueryVariables>;
export const ApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Application" },
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
            name: { kind: "Name", value: "application" },
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
                  name: { kind: "Name", value: "ApplicationSalarySelection" },
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
                        name: { kind: "Name", value: "generatedAt" },
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
                  name: { kind: "Name", value: "fit" },
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
                        name: { kind: "Name", value: "fitCount" },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ApplicationSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ApplicationType" },
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
} as unknown as DocumentNode<ApplicationQuery, ApplicationQueryVariables>;
export const CreateApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateApplication" },
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
              name: { kind: "Name", value: "CreateApplicationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createApplication" },
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
                  name: { kind: "Name", value: "ApplicationSalarySelection" },
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
      name: { kind: "Name", value: "ApplicationSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ApplicationType" },
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
} as unknown as DocumentNode<
  CreateApplicationMutation,
  CreateApplicationMutationVariables
>;
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
export const UpdateApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateApplication" },
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
              name: { kind: "Name", value: "UpdateApplicationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateApplication" },
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
                  name: { kind: "Name", value: "ApplicationSalarySelection" },
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
                        name: { kind: "Name", value: "generatedAt" },
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
      name: { kind: "Name", value: "ApplicationSalarySelection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ApplicationType" },
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
} as unknown as DocumentNode<
  UpdateApplicationMutation,
  UpdateApplicationMutationVariables
>;
export const RemoveApplicationTagDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveApplicationTag" },
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
            name: { kind: "Name", value: "removeApplicationTag" },
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
  RemoveApplicationTagMutation,
  RemoveApplicationTagMutationVariables
>;
export const DeleteApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteApplication" },
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
            name: { kind: "Name", value: "deleteApplication" },
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
  DeleteApplicationMutation,
  DeleteApplicationMutationVariables
>;
export const ApplicationStageEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ApplicationStageEvents" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "applicationStageEvents" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
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
  ApplicationStageEventsQuery,
  ApplicationStageEventsQueryVariables
>;
export const CreateApplicationStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateApplicationStageEvent" },
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
              name: { kind: "Name", value: "CreateApplicationStageEventInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createApplicationStageEvent" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
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
  CreateApplicationStageEventMutation,
  CreateApplicationStageEventMutationVariables
>;
export const UpdateApplicationStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateApplicationStageEvent" },
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
              name: { kind: "Name", value: "UpdateApplicationStageEventInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateApplicationStageEvent" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
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
  UpdateApplicationStageEventMutation,
  UpdateApplicationStageEventMutationVariables
>;
export const DeleteApplicationStageEventDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteApplicationStageEvent" },
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
            name: { kind: "Name", value: "deleteApplicationStageEvent" },
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
  DeleteApplicationStageEventMutation,
  DeleteApplicationStageEventMutationVariables
>;
export const ApplicationNotesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ApplicationNotes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "applicationNotes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
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
  ApplicationNotesQuery,
  ApplicationNotesQueryVariables
>;
export const CreateApplicationNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateApplicationNote" },
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
            name: { kind: "Name", value: "createApplicationNote" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
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
  CreateApplicationNoteMutation,
  CreateApplicationNoteMutationVariables
>;
export const UpdateApplicationNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateApplicationNote" },
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
            name: { kind: "Name", value: "updateApplicationNote" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
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
  UpdateApplicationNoteMutation,
  UpdateApplicationNoteMutationVariables
>;
export const DeleteApplicationNoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteApplicationNote" },
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
            name: { kind: "Name", value: "deleteApplicationNote" },
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
  DeleteApplicationNoteMutation,
  DeleteApplicationNoteMutationVariables
>;
export const GenerateApplicationNoteWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateApplicationNoteWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "generateApplicationNoteWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
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
  GenerateApplicationNoteWithAiQuery,
  GenerateApplicationNoteWithAiQueryVariables
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
export const GenerateApplicationLocationWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateApplicationLocationWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "generateApplicationLocationWithAI" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateApplicationLocationWithAiQuery,
  GenerateApplicationLocationWithAiQueryVariables
>;
export const GenerateApplicationWorkRegionWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateApplicationWorkRegionWithAi" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: {
              kind: "Name",
              value: "generateApplicationWorkRegionWithAI",
            },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateApplicationWorkRegionWithAiQuery,
  GenerateApplicationWorkRegionWithAiQueryVariables
>;
export const GenerateApplicationSummaryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateApplicationSummary" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "generateApplicationSummary" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
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
                        name: { kind: "Name", value: "generatedAt" },
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
  GenerateApplicationSummaryMutation,
  GenerateApplicationSummaryMutationVariables
>;
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
export const CompanyApplicationsCountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CompanyApplicationsCount" },
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
            name: { kind: "Name", value: "companyApplicationsCount" },
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
  CompanyApplicationsCountQuery,
  CompanyApplicationsCountQueryVariables
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
export const DraftApplicationsListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftApplicationsList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "draftApplications" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionStatus" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionError" },
                },
                { kind: "Field", name: { kind: "Name", value: "convertedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DraftApplicationsListQuery,
  DraftApplicationsListQueryVariables
>;
export const DraftApplicationDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftApplicationDetail" },
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
            name: { kind: "Name", value: "draftApplication" },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "htmlContent" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionStatus" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionError" },
                },
                { kind: "Field", name: { kind: "Name", value: "convertedAt" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fit" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "applicationId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "draftApplicationId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resumeId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "error" } },
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
                        name: { kind: "Name", value: "fitCount" },
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
} as unknown as DocumentNode<
  DraftApplicationDetailQuery,
  DraftApplicationDetailQueryVariables
>;
export const DeleteDraftApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteDraftApplication" },
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
            name: { kind: "Name", value: "deleteLinkedApplication" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteDraftApplication" },
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
                name: { kind: "Name", value: "deleteLinkedApplication" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "deleteLinkedApplication" },
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
  DeleteDraftApplicationMutation,
  DeleteDraftApplicationMutationVariables
>;
export const DeleteApplicationsForDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteApplicationsForDraft" },
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
            name: { kind: "Name", value: "deleteApplicationsForDraft" },
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
  DeleteApplicationsForDraftMutation,
  DeleteApplicationsForDraftMutationVariables
>;
export const CreateApplicationWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateApplicationWithAI" },
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
            name: { kind: "Name", value: "createApplicationWithAI" },
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
                  name: { kind: "Name", value: "conversionStatus" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionError" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateApplicationWithAiMutation,
  CreateApplicationWithAiMutationVariables
>;
export const CreateDraftApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateDraftApplication" },
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
              name: { kind: "Name", value: "CreateDraftApplicationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createDraftApplication" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionStatus" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionError" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDraftApplicationMutation,
  CreateDraftApplicationMutationVariables
>;
export const UpdateDraftApplicationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateDraftApplication" },
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
              name: { kind: "Name", value: "UpdateDraftApplicationInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateDraftApplication" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionStatus" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversionError" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateDraftApplicationMutation,
  UpdateDraftApplicationMutationVariables
>;
export const FitAnalysesListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FitAnalysesList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "fitAnalyses" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
                { kind: "Field", name: { kind: "Name", value: "gapCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "unclearCount" },
                },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "application" },
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
                  name: { kind: "Name", value: "draftApplication" },
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
  FitAnalysesListQuery,
  FitAnalysesListQueryVariables
>;
export const FitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Fit" },
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
            name: { kind: "Name", value: "fit" },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
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
                  name: { kind: "Name", value: "application" },
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
                  name: { kind: "Name", value: "draftApplication" },
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
} as unknown as DocumentNode<FitQuery, FitQueryVariables>;
export const ApplicationFitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ApplicationFit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "applicationId" },
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
            name: { kind: "Name", value: "applicationFit" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "applicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "applicationId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
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
} as unknown as DocumentNode<ApplicationFitQuery, ApplicationFitQueryVariables>;
export const DraftApplicationFitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DraftApplicationFit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "draftApplicationId" },
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
            name: { kind: "Name", value: "draftApplicationFit" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "draftApplicationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
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
  DraftApplicationFitQuery,
  DraftApplicationFitQueryVariables
>;
export const GenerateApplicationFitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateApplicationFit" },
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
              name: { kind: "Name", value: "GenerateFitInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateApplicationFit" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
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
  GenerateApplicationFitMutation,
  GenerateApplicationFitMutationVariables
>;
export const DeleteFitAnalysisDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteFitAnalysis" },
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
            name: { kind: "Name", value: "deleteFitAnalysis" },
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
  DeleteFitAnalysisMutation,
  DeleteFitAnalysisMutationVariables
>;
export const GenerateDraftApplicationFitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GenerateDraftApplicationFit" },
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
              name: { kind: "Name", value: "GenerateDraftFitInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateDraftApplicationFit" },
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
                  name: { kind: "Name", value: "applicationId" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "draftApplicationId" },
                },
                { kind: "Field", name: { kind: "Name", value: "resumeId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "error" } },
                { kind: "Field", name: { kind: "Name", value: "scoreRatio" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "classification" },
                },
                { kind: "Field", name: { kind: "Name", value: "fitCount" } },
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
  GenerateDraftApplicationFitMutation,
  GenerateDraftApplicationFitMutationVariables
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
export const UserPreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserPreferences" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userPreferences" },
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
  UserPreferencesQuery,
  UserPreferencesQueryVariables
>;
export const UpdateUserPreferencesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateUserPreferences" },
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
            name: { kind: "Name", value: "updateUserPreferences" },
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
  UpdateUserPreferencesMutation,
  UpdateUserPreferencesMutationVariables
>;
