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

export type AiExtractionFieldInput = {
  label: Scalars["String"]["input"];
  metadata?: InputMaybe<Scalars["String"]["input"]>;
};

export type ApplicationAiDraftType = {
  __typename?: "ApplicationAiDraftType";
  company: Scalars["String"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  noteContents: Array<Scalars["String"]["output"]>;
  salaryCurrency?: Maybe<Scalars["String"]["output"]>;
  salaryMaxCents?: Maybe<Scalars["Int"]["output"]>;
  salaryMinCents?: Maybe<Scalars["Int"]["output"]>;
  salaryPeriod?: Maybe<SalaryPeriod>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
};

export enum ApplicationQuickFilter {
  Active = "ACTIVE",
  Applied = "APPLIED",
  Incoming = "INCOMING",
  New = "NEW",
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
  salaryCurrency?: Maybe<Scalars["String"]["output"]>;
  salaryMaxCents?: Maybe<Scalars["Int"]["output"]>;
  salaryMinCents?: Maybe<Scalars["Int"]["output"]>;
  salaryPeriod?: Maybe<SalaryPeriod>;
  tags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
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
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateApplicationStageEventInput = {
  applicationId: Scalars["String"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  toStage: ApplicationStage;
};

export type CreateApplicationWithAiInput = {
  fields?: InputMaybe<Array<AiExtractionFieldInput>>;
  prompt: Scalars["String"]["input"];
};

export type CreateNoteInput = {
  applicationId: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  createApplication: ApplicationType;
  createApplicationNote: NoteType;
  createApplicationStageEvent: ApplicationStageEventType;
  createApplicationWithAI: ApplicationType;
  deleteApplication: Scalars["Boolean"]["output"];
  deleteApplicationNote: Scalars["Boolean"]["output"];
  removeApplicationTag: ApplicationType;
  updateApplication: ApplicationType;
  updateApplicationNote: NoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
  updateCompany: CompanyType;
};

export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};

export type MutationCreateApplicationNoteArgs = {
  input: CreateNoteInput;
};

export type MutationCreateApplicationStageEventArgs = {
  input: CreateApplicationStageEventInput;
};

export type MutationCreateApplicationWithAiArgs = {
  input: CreateApplicationWithAiInput;
};

export type MutationDeleteApplicationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteApplicationNoteArgs = {
  id: Scalars["ID"]["input"];
};

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
  generateApplicationDraftWithAI: ApplicationAiDraftType;
  generateApplicationNoteWithAI: Scalars["String"]["output"];
  generateCompanyDescription: Scalars["String"]["output"];
  me: UserType;
  rewriteApplicationTextWithAI: Scalars["String"]["output"];
};

export type QueryApplicationArgs = {
  id: Scalars["ID"]["input"];
};

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

export type QueryGenerateApplicationDraftWithAiArgs = {
  input: CreateApplicationWithAiInput;
};

export type QueryGenerateApplicationNoteWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
};

export type QueryGenerateCompanyDescriptionArgs = {
  companyName: Scalars["String"]["input"];
};

export type QueryRewriteApplicationTextWithAiArgs = {
  applicationId: Scalars["ID"]["input"];
  text: Scalars["String"]["input"];
};

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
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
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
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
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
  }>;
};

export type ApplicationQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ApplicationQuery = {
  __typename?: "Query";
  application: {
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
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
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    tags: Array<string>;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
  };
};

export type CreateApplicationWithAiMutationVariables = Exact<{
  input: CreateApplicationWithAiInput;
}>;

export type CreateApplicationWithAiMutation = {
  __typename?: "Mutation";
  createApplicationWithAI: {
    __typename?: "ApplicationType";
    id: string;
    title: string;
    companyId: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    tags: Array<string>;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
    };
  };
};

export type GenerateApplicationDraftWithAiQueryVariables = Exact<{
  input: CreateApplicationWithAiInput;
}>;

export type GenerateApplicationDraftWithAiQuery = {
  __typename?: "Query";
  generateApplicationDraftWithAI: {
    __typename?: "ApplicationAiDraftType";
    title: string;
    company: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    tags: Array<string>;
    noteContents: Array<string>;
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
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    tags: Array<string>;
    createdAt: any;
    company: {
      __typename?: "CompanyType";
      id: string;
      name: string;
      description?: string | null;
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
  deleteApplication: boolean;
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
  deleteApplicationNote: boolean;
};

export type GenerateApplicationNoteWithAiQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
  note: Scalars["String"]["input"];
}>;

export type GenerateApplicationNoteWithAiQuery = {
  __typename?: "Query";
  generateApplicationNoteWithAI: string;
};

export type RewriteApplicationTextWithAiQueryVariables = Exact<{
  applicationId: Scalars["ID"]["input"];
  text: Scalars["String"]["input"];
}>;

export type RewriteApplicationTextWithAiQuery = {
  __typename?: "Query";
  rewriteApplicationTextWithAI: string;
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
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
export const CreateApplicationWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateApplicationWithAi" },
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
              name: { kind: "Name", value: "CreateApplicationWithAIInput" },
            },
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
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
export const GenerateApplicationDraftWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GenerateApplicationDraftWithAi" },
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
              name: { kind: "Name", value: "CreateApplicationWithAIInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generateApplicationDraftWithAI" },
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
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "company" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "noteContents" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateApplicationDraftWithAiQuery,
  GenerateApplicationDraftWithAiQueryVariables
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
                { kind: "Field", name: { kind: "Name", value: "url" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMinCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryMaxCents" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryCurrency" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "salaryPeriod" },
                },
                { kind: "Field", name: { kind: "Name", value: "tags" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
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
export const RewriteApplicationTextWithAiDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RewriteApplicationTextWithAi" },
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
            name: { kind: "Name", value: "rewriteApplicationTextWithAI" },
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
  RewriteApplicationTextWithAiQuery,
  RewriteApplicationTextWithAiQueryVariables
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
