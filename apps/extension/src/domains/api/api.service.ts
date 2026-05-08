import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { captureSync } from "@job-tracker/async";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { createExtensionAuthLink } from "@/domains/api/create-extension-auth-link";
import {
  createExtensionSSELink,
  ExtensionSSELink,
} from "@/domains/api/create-extension-sse-link";
import {
  ClaimImportRunDocument,
  CreateDraftApplicationDocument,
  type CreateDraftApplicationInput,
  ImportRunEventsDocument,
  type ImportRunEventsSubscription,
  ImportRunsDocument,
  ImportRunStatus,
  UpdateImportRunStatusDocument,
} from "@/gql/graphql";

const GRAPHQL_URL =
  import.meta.env.WXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

const GRAPHQL_SSE_URL =
  import.meta.env.WXT_PUBLIC_API_GRAPHQL_SSE_URL ??
  defaultSseUrlFromGraphqlUrl(GRAPHQL_URL);

export type ImportRunEventHandler = (
  event: ImportRunEventsSubscription["importRunEvents"],
) => void;

type SubscriptionHandle = { unsubscribe: () => void };

export class ApiService {
  private readonly client: ApolloClient;
  private readonly sseLink: ExtensionSSELink;

  constructor() {
    const authLink = createExtensionAuthLink(GRAPHQL_URL);
    const authRefreshLink = createAuthRefreshLink(() =>
      getAuthRefreshUrl(GRAPHQL_URL),
    );
    const httpLink = new HttpLink({ uri: GRAPHQL_URL, credentials: "include" });

    this.sseLink = createExtensionSSELink(GRAPHQL_SSE_URL);

    const transportLink = ApolloLink.split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      this.sseLink,
      ApolloLink.from([authLink, httpLink]),
    );

    this.client = new ApolloClient({
      link: ApolloLink.from([authRefreshLink, transportLink]),
      cache: new InMemoryCache(),
    });
  }

  async createDraftApplication(input: CreateDraftApplicationInput) {
    return await this.client.mutate({
      mutation: CreateDraftApplicationDocument,
      variables: { input },
    });
  }

  async claimImportRun(id: string) {
    return await this.client.mutate({
      mutation: ClaimImportRunDocument,
      variables: { id },
    });
  }

  async updateImportRunStatus(id: string, status: ImportRunStatus) {
    return await this.client.mutate({
      mutation: UpdateImportRunStatusDocument,
      variables: { id, status },
    });
  }

  async importRuns() {
    return await this.client.query({
      query: ImportRunsDocument,
      fetchPolicy: "network-only",
    });
  }

  subscribeToImportRunEvents(
    onEvent: ImportRunEventHandler,
    onError?: (error: unknown) => void,
  ): SubscriptionHandle {
    const observable = this.client.subscribe({
      query: ImportRunEventsDocument,
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        if (data?.importRunEvents) {
          onEvent(data.importRunEvents);
        }
      },
      error: (error) => {
        onError?.(error);
      },
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }

  dispose(): void {
    this.sseLink.dispose();
    void this.client.stop();
  }
}

function getAuthRefreshUrl(graphqlUrl: string): string {
  const url = new URL(graphqlUrl);
  url.pathname = "/auth/refresh";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function defaultSseUrlFromGraphqlUrl(graphqlUrl: string): string {
  const [err, url] = captureSync(() => {
    const base = new URL(graphqlUrl);
    base.pathname = base.pathname.replace(/\/$/, "");
    const sse = new URL("./graphql-sse/stream", base.href);
    sse.search = "";
    sse.hash = "";
    return sse.toString();
  });
  if (!err) return url;
  return `${graphqlUrl.replace(/\/$/, "")}/graphql-sse/stream`;
}
