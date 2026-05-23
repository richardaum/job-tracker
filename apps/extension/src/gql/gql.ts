/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "mutation ClaimSourceRun($id: ID!) {\n  claimSourceRun(id: $id) {\n    id\n    sourceProfileId\n    status\n    startedAt\n    sourceProfile\n  }\n}": typeof types.ClaimSourceRunDocument;
  "mutation CreateDraftCaptureJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n    urls\n    htmlContent\n    currentStage\n    fillMetadata {\n      status\n      error\n      timestamp\n    }\n    createdAt\n  }\n}": typeof types.CreateDraftCaptureJobDocument;
  "mutation CreateJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n  }\n}": typeof types.CreateJobDocument;
  "subscription SourceRunEvents {\n  sourceRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      templateId\n      sourceProfileId\n      surfaceUrl\n      status\n      startedAt\n      sourceProfile\n    }\n  }\n}": typeof types.SourceRunEventsDocument;
  "query SourceRuns {\n  sourceRuns {\n    id\n    templateId\n    sourceProfileId\n    surfaceUrl\n    status\n    startedAt\n    sourceProfile\n  }\n}": typeof types.SourceRunsDocument;
  "mutation UpdateSourceRunStatus($id: ID!, $status: SourceRunStatus!) {\n  updateSourceRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}": typeof types.UpdateSourceRunStatusDocument;
  "mutation UpdateSourceRun($id: ID!, $input: UpdateSourceRunInput!) {\n  updateSourceRun(id: $id, input: $input) {\n    id\n    surfaceUrl\n  }\n}": typeof types.UpdateSourceRunDocument;
};
const documents: Documents = {
  "mutation ClaimSourceRun($id: ID!) {\n  claimSourceRun(id: $id) {\n    id\n    sourceProfileId\n    status\n    startedAt\n    sourceProfile\n  }\n}":
    types.ClaimSourceRunDocument,
  "mutation CreateDraftCaptureJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n    urls\n    htmlContent\n    currentStage\n    fillMetadata {\n      status\n      error\n      timestamp\n    }\n    createdAt\n  }\n}":
    types.CreateDraftCaptureJobDocument,
  "mutation CreateJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n  }\n}":
    types.CreateJobDocument,
  "subscription SourceRunEvents {\n  sourceRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      templateId\n      sourceProfileId\n      surfaceUrl\n      status\n      startedAt\n      sourceProfile\n    }\n  }\n}":
    types.SourceRunEventsDocument,
  "query SourceRuns {\n  sourceRuns {\n    id\n    templateId\n    sourceProfileId\n    surfaceUrl\n    status\n    startedAt\n    sourceProfile\n  }\n}":
    types.SourceRunsDocument,
  "mutation UpdateSourceRunStatus($id: ID!, $status: SourceRunStatus!) {\n  updateSourceRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}":
    types.UpdateSourceRunStatusDocument,
  "mutation UpdateSourceRun($id: ID!, $input: UpdateSourceRunInput!) {\n  updateSourceRun(id: $id, input: $input) {\n    id\n    surfaceUrl\n  }\n}":
    types.UpdateSourceRunDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation ClaimSourceRun($id: ID!) {\n  claimSourceRun(id: $id) {\n    id\n    sourceProfileId\n    status\n    startedAt\n    sourceProfile\n  }\n}",
): (typeof documents)["mutation ClaimSourceRun($id: ID!) {\n  claimSourceRun(id: $id) {\n    id\n    sourceProfileId\n    status\n    startedAt\n    sourceProfile\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateDraftCaptureJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n    urls\n    htmlContent\n    currentStage\n    fillMetadata {\n      status\n      error\n      timestamp\n    }\n    createdAt\n  }\n}",
): (typeof documents)["mutation CreateDraftCaptureJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n    urls\n    htmlContent\n    currentStage\n    fillMetadata {\n      status\n      error\n      timestamp\n    }\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n  }\n}",
): (typeof documents)["mutation CreateJob($input: CreateJobInput!) {\n  createJob(input: $input) {\n    id\n    title\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "subscription SourceRunEvents {\n  sourceRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      templateId\n      sourceProfileId\n      surfaceUrl\n      status\n      startedAt\n      sourceProfile\n    }\n  }\n}",
): (typeof documents)["subscription SourceRunEvents {\n  sourceRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      templateId\n      sourceProfileId\n      surfaceUrl\n      status\n      startedAt\n      sourceProfile\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query SourceRuns {\n  sourceRuns {\n    id\n    templateId\n    sourceProfileId\n    surfaceUrl\n    status\n    startedAt\n    sourceProfile\n  }\n}",
): (typeof documents)["query SourceRuns {\n  sourceRuns {\n    id\n    templateId\n    sourceProfileId\n    surfaceUrl\n    status\n    startedAt\n    sourceProfile\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateSourceRunStatus($id: ID!, $status: SourceRunStatus!) {\n  updateSourceRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}",
): (typeof documents)["mutation UpdateSourceRunStatus($id: ID!, $status: SourceRunStatus!) {\n  updateSourceRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateSourceRun($id: ID!, $input: UpdateSourceRunInput!) {\n  updateSourceRun(id: $id, input: $input) {\n    id\n    surfaceUrl\n  }\n}",
): (typeof documents)["mutation UpdateSourceRun($id: ID!, $input: UpdateSourceRunInput!) {\n  updateSourceRun(id: $id, input: $input) {\n    id\n    surfaceUrl\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
