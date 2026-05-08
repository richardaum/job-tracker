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
  Wellfound = "WELLFOUND",
}

export enum ApplicationStage {
  Applied = "APPLIED",
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
  id: Scalars["ID"]["output"];
  salary: ApplicationSalary;
  source?: Maybe<ApplicationSource>;
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
  url: Scalars["String"]["input"];
};

export type CreateImportRunInput = { importerId: Scalars["String"]["input"] };

export type CreateNoteInput = {
  applicationId: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
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
  htmlContent: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type ExchangeRate = {
  __typename?: "ExchangeRate";
  currency: Scalars["String"]["output"];
  rate: Scalars["Float"]["output"];
};

export enum ImportRunStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Running = "RUNNING",
}

export type ImportRunType = {
  __typename?: "ImportRunType";
  entryUrl: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  importerId: Scalars["String"]["output"];
  importerName: Scalars["String"]["output"];
  importerSource: Scalars["String"]["output"];
  startedAt: Scalars["DateTime"]["output"];
  status: ImportRunStatus;
};

export type Mutation = {
  __typename?: "Mutation";
  clearImportRuns: Scalars["Boolean"]["output"];
  createApplication: ApplicationType;
  createApplicationNote: NoteType;
  createApplicationStageEvent: ApplicationStageEventType;
  createApplicationWithAIV2: DraftApplicationType;
  createDraftApplication: DraftApplicationType;
  createImportRun: ImportRunType;
  deleteApplication: DeleteMutationPayloadType;
  deleteApplicationNote: DeleteMutationPayloadType;
  deleteApplicationStageEvent: DeleteMutationPayloadType;
  deleteCompany: DeleteMutationPayloadType;
  deleteDraftApplication: DeleteMutationPayloadType;
  deleteImportRun: DeleteMutationPayloadType;
  removeApplicationTag: ApplicationType;
  updateApplication: ApplicationType;
  updateApplicationNote: NoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
  updateCompany: CompanyType;
  updateDraftApplication: DraftApplicationType;
  updateImportRunStatus: ImportRunType;
};

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

export type MutationCreateImportRunArgs = { input: CreateImportRunInput };

export type MutationDeleteApplicationArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteApplicationNoteArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteApplicationStageEventArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteCompanyArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteDraftApplicationArgs = { id: Scalars["ID"]["input"] };

export type MutationDeleteImportRunArgs = { id: Scalars["ID"]["input"] };

export type MutationRemoveApplicationTagArgs = {
  id: Scalars["ID"]["input"];
  tag: Scalars["String"]["input"];
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

export type MutationUpdateImportRunStatusArgs = {
  id: Scalars["ID"]["input"];
  status: ImportRunStatus;
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

export type Query = {
  __typename?: "Query";
  application: ApplicationType;
  applicationNotes: Array<NoteType>;
  applicationStageEvents: Array<ApplicationStageEventType>;
  applications: Array<ApplicationType>;
  companies: Array<CompanyType>;
  companyApplicationsCount: Scalars["Int"]["output"];
  draftApplication: DraftApplicationType;
  draftApplications: Array<DraftApplicationType>;
  exchangeRates: CurrencyRates;
  generateApplicationNoteWithAI: Scalars["String"]["output"];
  generateCompanyDescription: Scalars["String"]["output"];
  importRuns: Array<ImportRunType>;
  me: UserType;
  restructureJobDescriptionWithAI: Scalars["String"]["output"];
  rewriteTextWithAI: Scalars["String"]["output"];
};

export type QueryApplicationArgs = { id: Scalars["ID"]["input"] };

export type QueryApplicationNotesArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryApplicationStageEventsArgs = {
  applicationId: Scalars["ID"]["input"];
};

export type QueryApplicationsArgs = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  filter?: InputMaybe<ApplicationQuickFilter>;
};

export type QueryCompanyApplicationsCountArgs = { id: Scalars["ID"]["input"] };

export type QueryDraftApplicationArgs = { id: Scalars["ID"]["input"] };

export type QueryExchangeRatesArgs = {
  base: Scalars["String"]["input"];
  currencies: Array<Scalars["String"]["input"]>;
};

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

export type QueryRewriteTextWithAiArgs = { text: Scalars["String"]["input"] };

export enum SalaryPeriod {
  Hour = "HOUR",
  Month = "MONTH",
  Year = "YEAR",
}

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

export type UserType = {
  __typename?: "UserType";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  role: Scalars["String"]["output"];
};

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
    url: string;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
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
    url: string;
    title: string;
    htmlContent: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type DeleteDraftApplicationMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteDraftApplicationMutation = {
  __typename?: "Mutation";
  deleteDraftApplication: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type CreateApplicationWithAiV2MutationVariables = Exact<{
  draftId: Scalars["ID"]["input"];
}>;

export type CreateApplicationWithAiV2Mutation = {
  __typename?: "Mutation";
  createApplicationWithAIV2: {
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
    url: string;
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
    url: string;
    title: string;
    conversionStatus: DraftApplicationConversionStatus;
    conversionError?: string | null;
  };
};

export type ImportRunsQueryVariables = Exact<{ [key: string]: never }>;

export type ImportRunsQuery = {
  __typename?: "Query";
  importRuns: Array<{
    __typename?: "ImportRunType";
    id: string;
    importerId: string;
    importerName: string;
    entryUrl: string;
    status: ImportRunStatus;
    startedAt: any;
    importerSource: string;
  }>;
};

export type CreateImportRunMutationVariables = Exact<{
  input: CreateImportRunInput;
}>;

export type CreateImportRunMutation = {
  __typename?: "Mutation";
  createImportRun: {
    __typename?: "ImportRunType";
    id: string;
    importerId: string;
    importerName: string;
    entryUrl: string;
    status: ImportRunStatus;
    startedAt: any;
    importerSource: string;
  };
};

export type DeleteImportRunMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteImportRunMutation = {
  __typename?: "Mutation";
  deleteImportRun: {
    __typename?: "DeleteMutationPayloadType";
    success: boolean;
    deletedId: string;
  };
};

export type ClearImportRunsMutationVariables = Exact<{ [key: string]: never }>;

export type ClearImportRunsMutation = {
  __typename?: "Mutation";
  clearImportRuns: boolean;
};

export type UpdateImportRunStatusMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  status: ImportRunStatus;
}>;

export type UpdateImportRunStatusMutation = {
  __typename?: "Mutation";
  updateImportRunStatus: {
    __typename?: "ImportRunType";
    id: string;
    status: ImportRunStatus;
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
  query Applications($filter: ApplicationQuickFilter, $company: String) {
    applications(filter: $filter, company: $company) {
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
      currentStage
      currentStageReason
      currentStageAt
      createdAt
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

export type ApplicationsQueryHookResult = ReturnType<
  typeof useApplicationsQuery
>;
export type ApplicationsLazyQueryHookResult = ReturnType<
  typeof useApplicationsLazyQuery
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
      currentStage
      currentStageReason
      currentStageAt
      createdAt
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

export type ApplicationQueryHookResult = ReturnType<typeof useApplicationQuery>;
export type ApplicationLazyQueryHookResult = ReturnType<
  typeof useApplicationLazyQuery
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
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

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
      createdAt
    }
  }
  ${ApplicationSalarySelectionFragmentDoc}
`;

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

export const RemoveApplicationTagDocument = gql`
  mutation RemoveApplicationTag($id: ID!, $tag: String!) {
    removeApplicationTag(id: $id, tag: $tag) {
      id
      tags
    }
  }
`;

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

export const DeleteApplicationDocument = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id) {
      success
      deletedId
    }
  }
`;

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

export type ApplicationStageEventsQueryHookResult = ReturnType<
  typeof useApplicationStageEventsQuery
>;
export type ApplicationStageEventsLazyQueryHookResult = ReturnType<
  typeof useApplicationStageEventsLazyQuery
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

export const DeleteApplicationStageEventDocument = gql`
  mutation DeleteApplicationStageEvent($id: ID!) {
    deleteApplicationStageEvent(id: $id) {
      success
      deletedId
    }
  }
`;

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

export type ApplicationNotesQueryHookResult = ReturnType<
  typeof useApplicationNotesQuery
>;
export type ApplicationNotesLazyQueryHookResult = ReturnType<
  typeof useApplicationNotesLazyQuery
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

export const DeleteApplicationNoteDocument = gql`
  mutation DeleteApplicationNote($id: ID!) {
    deleteApplicationNote(id: $id) {
      success
      deletedId
    }
  }
`;

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

export type GenerateApplicationNoteWithAiQueryHookResult = ReturnType<
  typeof useGenerateApplicationNoteWithAiQuery
>;
export type GenerateApplicationNoteWithAiLazyQueryHookResult = ReturnType<
  typeof useGenerateApplicationNoteWithAiLazyQuery
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

export type CompanyApplicationsCountQueryHookResult = ReturnType<
  typeof useCompanyApplicationsCountQuery
>;
export type CompanyApplicationsCountLazyQueryHookResult = ReturnType<
  typeof useCompanyApplicationsCountLazyQuery
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

export const DraftApplicationsListDocument = gql`
  query DraftApplicationsList {
    draftApplications {
      id
      applicationId
      url
      title
      conversionStatus
      conversionError
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

export type DraftApplicationsListQueryHookResult = ReturnType<
  typeof useDraftApplicationsListQuery
>;
export type DraftApplicationsListLazyQueryHookResult = ReturnType<
  typeof useDraftApplicationsListLazyQuery
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

export type DraftApplicationDetailQueryHookResult = ReturnType<
  typeof useDraftApplicationDetailQuery
>;
export type DraftApplicationDetailLazyQueryHookResult = ReturnType<
  typeof useDraftApplicationDetailLazyQuery
>;

export const DeleteDraftApplicationDocument = gql`
  mutation DeleteDraftApplication($id: ID!) {
    deleteDraftApplication(id: $id) {
      success
      deletedId
    }
  }
`;

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

export const CreateApplicationWithAiV2Document = gql`
  mutation CreateApplicationWithAiV2($draftId: ID!) {
    createApplicationWithAIV2(draftId: $draftId) {
      id
      title
      conversionStatus
      conversionError
    }
  }
`;

/**
 * __useCreateApplicationWithAiV2Mutation__
 *
 * To run a mutation, you first call `useCreateApplicationWithAiV2Mutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateApplicationWithAiV2Mutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createApplicationWithAiV2Mutation, { data, loading, error }] = useCreateApplicationWithAiV2Mutation({
 *   variables: {
 *      draftId: // value for 'draftId'
 *   },
 * });
 */
export function useCreateApplicationWithAiV2Mutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateApplicationWithAiV2Mutation,
    CreateApplicationWithAiV2MutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateApplicationWithAiV2Mutation,
    CreateApplicationWithAiV2MutationVariables
  >(CreateApplicationWithAiV2Document, options);
}

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

export const ImportRunsDocument = gql`
  query ImportRuns {
    importRuns {
      id
      importerId
      importerName
      entryUrl
      status
      startedAt
      importerSource
    }
  }
`;

/**
 * __useImportRunsQuery__
 *
 * To run a query within a React component, call `useImportRunsQuery` and pass it any options that fit your needs.
 * When your component renders, `useImportRunsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useImportRunsQuery({
 *   variables: {
 *   },
 * });
 */
export function useImportRunsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ImportRunsQuery,
    ImportRunsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ImportRunsQuery, ImportRunsQueryVariables>(
    ImportRunsDocument,
    options,
  );
}
export function useImportRunsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ImportRunsQuery,
    ImportRunsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ImportRunsQuery,
    ImportRunsQueryVariables
  >(ImportRunsDocument, options);
}

export type ImportRunsQueryHookResult = ReturnType<typeof useImportRunsQuery>;
export type ImportRunsLazyQueryHookResult = ReturnType<
  typeof useImportRunsLazyQuery
>;

export const CreateImportRunDocument = gql`
  mutation CreateImportRun($input: CreateImportRunInput!) {
    createImportRun(input: $input) {
      id
      importerId
      importerName
      entryUrl
      status
      startedAt
      importerSource
    }
  }
`;

/**
 * __useCreateImportRunMutation__
 *
 * To run a mutation, you first call `useCreateImportRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateImportRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createImportRunMutation, { data, loading, error }] = useCreateImportRunMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateImportRunMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CreateImportRunMutation,
    CreateImportRunMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CreateImportRunMutation,
    CreateImportRunMutationVariables
  >(CreateImportRunDocument, options);
}

export const DeleteImportRunDocument = gql`
  mutation DeleteImportRun($id: ID!) {
    deleteImportRun(id: $id) {
      success
      deletedId
    }
  }
`;

/**
 * __useDeleteImportRunMutation__
 *
 * To run a mutation, you first call `useDeleteImportRunMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteImportRunMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteImportRunMutation, { data, loading, error }] = useDeleteImportRunMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteImportRunMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    DeleteImportRunMutation,
    DeleteImportRunMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    DeleteImportRunMutation,
    DeleteImportRunMutationVariables
  >(DeleteImportRunDocument, options);
}

export const ClearImportRunsDocument = gql`
  mutation ClearImportRuns {
    clearImportRuns
  }
`;

/**
 * __useClearImportRunsMutation__
 *
 * To run a mutation, you first call `useClearImportRunsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearImportRunsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearImportRunsMutation, { data, loading, error }] = useClearImportRunsMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearImportRunsMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ClearImportRunsMutation,
    ClearImportRunsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ClearImportRunsMutation,
    ClearImportRunsMutationVariables
  >(ClearImportRunsDocument, options);
}

export const UpdateImportRunStatusDocument = gql`
  mutation UpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {
    updateImportRunStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

/**
 * __useUpdateImportRunStatusMutation__
 *
 * To run a mutation, you first call `useUpdateImportRunStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateImportRunStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateImportRunStatusMutation, { data, loading, error }] = useUpdateImportRunStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateImportRunStatusMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateImportRunStatusMutation,
    UpdateImportRunStatusMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateImportRunStatusMutation,
    UpdateImportRunStatusMutationVariables
  >(UpdateImportRunStatusDocument, options);
}

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

export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
