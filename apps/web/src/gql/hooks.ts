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

export type ApplicationNoteType = {
  __typename?: "ApplicationNoteType";
  applicationId?: Maybe<Scalars["String"]["output"]>;
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  revision: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

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
  scheduledAt?: Maybe<Scalars["DateTime"]["output"]>;
  source: Scalars["String"]["output"];
  toStage: ApplicationStage;
  userId: Scalars["String"]["output"];
};

export type ApplicationType = {
  __typename?: "ApplicationType";
  company: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  salaryCurrency?: Maybe<Scalars["String"]["output"]>;
  salaryMaxCents?: Maybe<Scalars["Int"]["output"]>;
  salaryMinCents?: Maybe<Scalars["Int"]["output"]>;
  salaryPeriod?: Maybe<SalaryPeriod>;
  salaryTags: Array<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  url?: Maybe<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
};

export type CreateApplicationInput = {
  company: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  salaryTags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title: Scalars["String"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateApplicationNoteInput = {
  applicationId: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
};

export type CreateApplicationStageEventInput = {
  applicationId: Scalars["String"]["input"];
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  toStage: ApplicationStage;
};

export type Mutation = {
  __typename?: "Mutation";
  createApplication: ApplicationType;
  createApplicationNote: ApplicationNoteType;
  createApplicationStageEvent: ApplicationStageEventType;
  deleteApplication: Scalars["Boolean"]["output"];
  deleteApplicationNote: Scalars["Boolean"]["output"];
  updateApplication: ApplicationType;
  updateApplicationNote: ApplicationNoteType;
  updateApplicationStageEvent: ApplicationStageEventType;
};

export type MutationCreateApplicationArgs = {
  input: CreateApplicationInput;
};

export type MutationCreateApplicationNoteArgs = {
  input: CreateApplicationNoteInput;
};

export type MutationCreateApplicationStageEventArgs = {
  input: CreateApplicationStageEventInput;
};

export type MutationDeleteApplicationArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteApplicationNoteArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdateApplicationArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApplicationInput;
};

export type MutationUpdateApplicationNoteArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApplicationNoteInput;
};

export type MutationUpdateApplicationStageEventArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateApplicationStageEventInput;
};

export type Query = {
  __typename?: "Query";
  application: ApplicationType;
  applicationNotes: Array<ApplicationNoteType>;
  applicationStageEvents: Array<ApplicationStageEventType>;
  applications: Array<ApplicationType>;
  me: UserType;
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

export enum SalaryPeriod {
  Hour = "HOUR",
  Month = "MONTH",
  Year = "YEAR",
}

export type UpdateApplicationInput = {
  company?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  salaryCurrency?: InputMaybe<Scalars["String"]["input"]>;
  salaryMaxCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryMinCents?: InputMaybe<Scalars["Int"]["input"]>;
  salaryPeriod?: InputMaybe<SalaryPeriod>;
  salaryTags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateApplicationNoteInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  expectedRevision: Scalars["Int"]["input"];
};

export type UpdateApplicationStageEventInput = {
  scheduledAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  toStage?: InputMaybe<ApplicationStage>;
};

export type UserType = {
  __typename?: "UserType";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  role: Scalars["String"]["output"];
};

export type ApplicationsQueryVariables = Exact<{ [key: string]: never }>;

export type ApplicationsQuery = {
  __typename?: "Query";
  applications: Array<{
    __typename?: "ApplicationType";
    id: string;
    title: string;
    company: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    salaryTags: Array<string>;
    createdAt: any;
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
    company: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    salaryTags: Array<string>;
    createdAt: any;
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
    company: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    salaryTags: Array<string>;
    createdAt: any;
  };
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
    company: string;
    description?: string | null;
    url?: string | null;
    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryCurrency?: string | null;
    salaryPeriod?: SalaryPeriod | null;
    salaryTags: Array<string>;
    createdAt: any;
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
    __typename?: "ApplicationNoteType";
    id: string;
    applicationId?: string | null;
    content: string;
    revision: number;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type CreateApplicationNoteMutationVariables = Exact<{
  input: CreateApplicationNoteInput;
}>;

export type CreateApplicationNoteMutation = {
  __typename?: "Mutation";
  createApplicationNote: {
    __typename?: "ApplicationNoteType";
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
  input: UpdateApplicationNoteInput;
}>;

export type UpdateApplicationNoteMutation = {
  __typename?: "Mutation";
  updateApplicationNote: {
    __typename?: "ApplicationNoteType";
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

export const ApplicationsDocument = gql`
  query Applications {
    applications {
      id
      title
      company
      description
      url
      salaryMinCents
      salaryMaxCents
      salaryCurrency
      salaryPeriod
      salaryTags
      createdAt
    }
  }
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
      company
      description
      url
      salaryMinCents
      salaryMaxCents
      salaryCurrency
      salaryPeriod
      salaryTags
      createdAt
    }
  }
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
      company
      description
      url
      salaryMinCents
      salaryMaxCents
      salaryCurrency
      salaryPeriod
      salaryTags
      createdAt
    }
  }
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

export const UpdateApplicationDocument = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      title
      company
      description
      url
      salaryMinCents
      salaryMaxCents
      salaryCurrency
      salaryPeriod
      salaryTags
      createdAt
    }
  }
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

export const DeleteApplicationDocument = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id)
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
  mutation CreateApplicationNote($input: CreateApplicationNoteInput!) {
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
  mutation UpdateApplicationNote(
    $id: ID!
    $input: UpdateApplicationNoteInput!
  ) {
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
    deleteApplicationNote(id: $id)
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
