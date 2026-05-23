import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { createAuthRefreshLink } from "@job-tracker/auth";
import { tryRun } from "@job-tracker/try-run";

import { createExtensionAuthLink } from "@/domains/api/create-extension-auth-link";
import {
  createExtensionSSELink,
  ExtensionSSELink,
} from "@/domains/api/create-extension-sse-link";
import {
  ClaimSourceRunDocument,
  CreateDraftCaptureJobDocument,
  CreateJobDocument,
  type CreateJobInput,
  SourceRunEventsDocument,
  type SourceRunEventsSubscription,
  SourceRunsDocument,
  SourceRunStatus,
  UpdateSourceRunDocument,
  UpdateSourceRunStatusDocument,
} from "@/gql/graphql";

const API_URL = import.meta.env.WXT_PUBLIC_API_URL ?? "http://localhost:3101";
const GRAPHQL_URL = `${API_URL}/graphql`;

const GRAPHQL_SSE_URL =
  import.meta.env.WXT_PUBLIC_API_GRAPHQL_SSE_URL ??
  defaultSseUrlFromGraphqlUrl(GRAPHQL_URL);

export type SourceRunEventHandler = (
  event: SourceRunEventsSubscription["sourceRunEvents"],
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

  async createJob(input: CreateJobInput) {
    return await this.client.mutate({
      mutation: CreateJobDocument,
      variables: { input },
    });
  }

  async createDraftCaptureJob(input: CreateJobInput) {
    return await this.client.mutate({
      mutation: CreateDraftCaptureJobDocument,
      variables: { input: { ...input, createAsDraftCapture: true } },
    });
  }

  async claimSourceRun(id: string) {
    return await this.client.mutate({
      mutation: ClaimSourceRunDocument,
      variables: { id },
    });
  }

  async updateSourceRunStatus(id: string, status: SourceRunStatus) {
    return await this.client.mutate({
      mutation: UpdateSourceRunStatusDocument,
      variables: { id, status },
    });
  }

  async updateSourceRunSurfaceUrl(id: string, surfaceUrl: string) {
    return await this.client.mutate({
      mutation: UpdateSourceRunDocument,
      variables: { id, input: { surfaceUrl } },
    });
  }

  async sourceRuns() {
    return await this.client.query({
      query: SourceRunsDocument,
      fetchPolicy: "network-only",
    });
  }

  subscribeToSourceRunEvents(
    onEvent: SourceRunEventHandler,
    onError?: (error: unknown) => void,
  ): SubscriptionHandle {
    const observable = this.client.subscribe({
      query: SourceRunEventsDocument,
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        if (data?.sourceRunEvents) {
          onEvent(data.sourceRunEvents);
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
  const [err, url] = tryRun(() => {
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
