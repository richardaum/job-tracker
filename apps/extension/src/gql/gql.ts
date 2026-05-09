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
  "mutation ClaimImportRun($id: ID!) {\n  claimImportRun(id: $id) {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}": typeof types.ClaimImportRunDocument;
  "mutation CreateApplication($input: CreateApplicationInput!) {\n  createApplication(input: $input) {\n    id\n    title\n  }\n}": typeof types.CreateApplicationDocument;
  "mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {\n  createDraftApplication(input: $input) {\n    id\n    url\n    title\n  }\n}": typeof types.CreateDraftApplicationDocument;
  "subscription ImportRunEvents {\n  importRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      importerId\n      status\n      startedAt\n      importerSource\n    }\n  }\n}": typeof types.ImportRunEventsDocument;
  "query ImportRuns {\n  importRuns {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}": typeof types.ImportRunsDocument;
  "mutation UpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {\n  updateImportRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}": typeof types.UpdateImportRunStatusDocument;
};
const documents: Documents = {
  "mutation ClaimImportRun($id: ID!) {\n  claimImportRun(id: $id) {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}":
    types.ClaimImportRunDocument,
  "mutation CreateApplication($input: CreateApplicationInput!) {\n  createApplication(input: $input) {\n    id\n    title\n  }\n}":
    types.CreateApplicationDocument,
  "mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {\n  createDraftApplication(input: $input) {\n    id\n    url\n    title\n  }\n}":
    types.CreateDraftApplicationDocument,
  "subscription ImportRunEvents {\n  importRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      importerId\n      status\n      startedAt\n      importerSource\n    }\n  }\n}":
    types.ImportRunEventsDocument,
  "query ImportRuns {\n  importRuns {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}":
    types.ImportRunsDocument,
  "mutation UpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {\n  updateImportRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}":
    types.UpdateImportRunStatusDocument,
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
  source: "mutation ClaimImportRun($id: ID!) {\n  claimImportRun(id: $id) {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}",
): (typeof documents)["mutation ClaimImportRun($id: ID!) {\n  claimImportRun(id: $id) {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateApplication($input: CreateApplicationInput!) {\n  createApplication(input: $input) {\n    id\n    title\n  }\n}",
): (typeof documents)["mutation CreateApplication($input: CreateApplicationInput!) {\n  createApplication(input: $input) {\n    id\n    title\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {\n  createDraftApplication(input: $input) {\n    id\n    url\n    title\n  }\n}",
): (typeof documents)["mutation CreateDraftApplication($input: CreateDraftApplicationInput!) {\n  createDraftApplication(input: $input) {\n    id\n    url\n    title\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "subscription ImportRunEvents {\n  importRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      importerId\n      status\n      startedAt\n      importerSource\n    }\n  }\n}",
): (typeof documents)["subscription ImportRunEvents {\n  importRunEvents {\n    type\n    occurredAt\n    run {\n      id\n      importerId\n      status\n      startedAt\n      importerSource\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query ImportRuns {\n  importRuns {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}",
): (typeof documents)["query ImportRuns {\n  importRuns {\n    id\n    importerId\n    status\n    startedAt\n    importerSource\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "mutation UpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {\n  updateImportRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}",
): (typeof documents)["mutation UpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {\n  updateImportRunStatus(id: $id, status: $status) {\n    id\n    status\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
