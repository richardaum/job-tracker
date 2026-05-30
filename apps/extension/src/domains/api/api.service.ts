import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { createAuthRefreshLink } from "@job-tracker/auth";
import { tryRun } from "@job-tracker/try-run";

import { createExtensionAuthLink } from "@/domains/api/create-extension-auth-link";
import {
  CreateDraftCaptureJobDocument,
  CreateJobDocument,
  type CreateJobInput,
  IsJobDuplicateDocument,
  MeDocument,
  ReportExtensionActivityDocument,
  type ReportExtensionActivityInput,
  SourceRunsDocument,
  SourceRunStatus,
  UpdateSourceRunDocument,
  UpdateSourceRunStatusDocument,
} from "@/gql/graphql";

const API_URL = import.meta.env.WXT_PUBLIC_API_URL ?? "http://localhost:3101";
const GRAPHQL_URL = `${API_URL}/graphql`;

type ApiServiceOptions = { onAuthRefreshResult?: (success: boolean) => void };

export class ApiService {
  private readonly client: ApolloClient;

  constructor(options?: ApiServiceOptions) {
    const authLink = createExtensionAuthLink(GRAPHQL_URL);
    const authRefreshLink = createAuthRefreshLink(
      () => getAuthRefreshUrl(GRAPHQL_URL),
      { onRefreshResult: options?.onAuthRefreshResult },
    );
    const httpLink = new HttpLink({ uri: GRAPHQL_URL, credentials: "include" });

    this.client = new ApolloClient({
      link: ApolloLink.from([authRefreshLink, authLink, httpLink]),
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

  async updateSourceRunStatus(
    id: string,
    status: SourceRunStatus,
    errorMessage?: string | null,
  ) {
    return await this.client.mutate({
      mutation: UpdateSourceRunStatusDocument,
      variables: { id, status, errorMessage: errorMessage ?? null },
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

  async meEmail(): Promise<string | null> {
    const [err, result] = await tryRun(
      this.client.query({ query: MeDocument, fetchPolicy: "network-only" }),
    );

    if (err) return null;

    return result.data?.me?.email ?? null;
  }

  async isJobDuplicate(
    company: string,
    title: string,
  ): Promise<boolean> {
    const [err, result] = await tryRun(
      this.client.query({
        query: IsJobDuplicateDocument,
        variables: { company, title },
        fetchPolicy: "network-only",
      }),
    );

    if (err) return false;

    return result.data?.isJobDuplicate ?? false;
  }

  async reportExtensionActivity(input: ReportExtensionActivityInput) {
    return await this.client.mutate({
      mutation: ReportExtensionActivityDocument,
      variables: { input },
    });
  }

  dispose(): void {
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
