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
  salary: ApplicationSalary;
  source?: Maybe<ApplicationSource>;
  sourceRunId?: Maybe<Scalars["ID"]["output"]>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  urls: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
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
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  sourceRunId?: InputMaybe<Scalars["ID"]["input"]>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
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

export type CreateSourceInput = {
  sourceProfileId: Scalars["String"]["input"];
  surfaceUrl: Scalars["String"]["input"];
};

export type CreateSourceRunInput = {
  sourceProfileId: Scalars["String"]["input"];
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
  createApplicationWithAIV2: DraftApplicationType;
  createDraftApplication: DraftApplicationType;
  createResume: ResumeType;
  createSource: SourceTemplateType;
  createSourceRun: SourceRunType;
  deleteApplication: DeleteMutationPayloadType;
  deleteApplicationNote: DeleteMutationPayloadType;
  deleteApplicationStageEvent: DeleteMutationPayloadType;
  deleteApplicationsForDraft: DeleteMutationPayloadType;
  deleteCompany: DeleteMutationPayloadType;
  deleteDraftApplication: DeleteMutationPayloadType;
  deleteFitAnalysis: DeleteMutationPayloadType;
  deleteResume: DeleteMutationPayloadType;
  deleteSource: DeleteMutationPayloadType;
  deleteSourceRun: DeleteMutationPayloadType;
  detachApplicationsFromSourceRun: Scalars["Int"]["output"];
  generateApplicationFit: FitAnalysisType;
  generateDraftApplicationFit: FitAnalysisType;
  removeApplicationTag: ApplicationType;
  rerunSource: SourceRunType;
  updateApplication: ApplicationType;
  updateApplicationNote: NoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
  updateCompany: CompanyType;
  updateDraftApplication: DraftApplicationType;
  updateResume: ResumeType;
  updateSource: SourceTemplateType;
  updateSourceRun: SourceRunType;
  updateSourceRunStatus: SourceRunType;
  updateUserPreferences: Array<PreferenceType>;
};

export type MutationClaimSourceRunArgs = { id: Scalars["ID"]["input"] };

export type MutationCreateApplicationArgs = { input: CreateApplicationInput };

export type MutationCreateApplicationNoteArgs = { input: CreateNoteInput };

export type MutationCreateApplicationStageEventArgs = {
  input: CreateApplicationStageEventInput;
};

export type MutationCreateApplicationWithAiv2Args = {
  draftId: Scalars["ID"]["input"];
};

export type MutationCreateDraftApplicationArgs = {
  input: CreateDraftApplicationInput;
};

export type MutationCreateResumeArgs = { input: CreateResumeInput };

export type MutationCreateSourceArgs = { input: CreateSourceInput };

export type MutationCreateSourceRunArgs = { input: CreateSourceRunInput };

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

export type MutationDeleteSourceArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteSourceRunArgs = { id: Scalars["ID"]["input"] };

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

export type MutationRerunSourceArgs = { templateId: Scalars["ID"]["input"] };

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

export type MutationUpdateSourceArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSourceInput;
};

export type MutationUpdateSourceRunArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateSourceRunInput;
};

export type MutationUpdateSourceRunStatusArgs = {
  id: Scalars["ID"]["input"];
  status: SourceRunStatus;
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
  generateApplicationNoteWithAI: Scalars["String"]["output"];
  generateCompanyDescription: Scalars["String"]["output"];
  me: UserType;
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  resume: ResumeType;
  resumes: Array<ResumeType>;
  rewriteTextWithAI: Scalars["String"]["output"];
  sourceProfiles: Array<SourceProfileType>;
  sourceRuns: Array<SourceRunType>;
  sources: Array<SourceTemplateType>;
  sourcesForSourceProfile: Array<SourceTemplateType>;
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

export type QueryGenerateApplicationNoteWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
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

export type QuerySourcesForSourceProfileArgs = {
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
  sourceProfileId: Scalars["String"]["output"];
  sourceProfileSource: Scalars["String"]["output"];
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
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  source?: InputMaybe<ApplicationSource>;
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  urls?: InputMaybe<Array<Scalars["String"]["input"]>>;
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

export type UpdateSourceInput = {
  scheduleCron?: InputMaybe<Scalars["String"]["input"]>;
  scheduleEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  surfaceUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateSourceRunInput = { surfaceUrl: Scalars["String"]["input"] };

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

export type ClaimSourceRunMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ClaimSourceRunMutation = {
  __typename?: "Mutation";
  claimSourceRun?: {
    __typename?: "SourceRunType";
    id: string;
    sourceProfileId: string;
    status: SourceRunStatus;
    startedAt: any;
    sourceProfileSource: string;
  } | null;
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
    url?: string | null;
    title: string;
  };
};

export type SourceRunEventsSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type SourceRunEventsSubscription = {
  __typename?: "Subscription";
  sourceRunEvents: {
    __typename?: "SourceRunEvent";
    type: SourceRunEventType;
    occurredAt: any;
    run: {
      __typename?: "SourceRunType";
      id: string;
      templateId: string;
      sourceProfileId: string;
      surfaceUrl: string;
      status: SourceRunStatus;
      startedAt: any;
      sourceProfileSource: string;
    };
  };
};

export type SourceRunsQueryVariables = Exact<{ [key: string]: never }>;

export type SourceRunsQuery = {
  __typename?: "Query";
  sourceRuns: Array<{
    __typename?: "SourceRunType";
    id: string;
    templateId: string;
    sourceProfileId: string;
    surfaceUrl: string;
    status: SourceRunStatus;
    startedAt: any;
    sourceProfileSource: string;
  }>;
};

export type UpdateSourceRunStatusMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  status: SourceRunStatus;
}>;

export type UpdateSourceRunStatusMutation = {
  __typename?: "Mutation";
  updateSourceRunStatus: {
    __typename?: "SourceRunType";
    id: string;
    status: SourceRunStatus;
  };
};

export type UpdateSourceRunMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  input: UpdateSourceRunInput;
}>;

export type UpdateSourceRunMutation = {
  __typename?: "Mutation";
  updateSourceRun: {
    __typename?: "SourceRunType";
    id: string;
    surfaceUrl: string;
  };
};

export const ClaimSourceRunDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ClaimSourceRun" },
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
            name: { kind: "Name", value: "claimSourceRun" },
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
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileSource" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ClaimSourceRunMutation,
  ClaimSourceRunMutationVariables
>;
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
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
export const SourceRunEventsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "SourceRunEvents" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sourceRunEvents" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "occurredAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "run" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "templateId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceProfileId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "surfaceUrl" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "startedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sourceProfileSource" },
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
  SourceRunEventsSubscription,
  SourceRunEventsSubscriptionVariables
>;
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileId" },
                },
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "startedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sourceProfileSource" },
                },
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
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SourceRunStatus" },
            },
          },
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
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSourceRunStatusMutation,
  UpdateSourceRunStatusMutationVariables
>;
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
              name: { kind: "Name", value: "UpdateSourceRunInput" },
            },
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
                { kind: "Field", name: { kind: "Name", value: "surfaceUrl" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSourceRunMutation,
  UpdateSourceRunMutationVariables
>;
