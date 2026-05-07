import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { createExtensionAuthLink } from "@/domains/api/create-extension-auth-link";
import {
  CreateDraftApplicationDocument,
  type CreateDraftApplicationInput,
} from "@/gql/graphql";

const GRAPHQL_URL =
  import.meta.env.WXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

export class ApiService {
  private readonly client: ApolloClient;

  constructor() {
    const authLink = createExtensionAuthLink(GRAPHQL_URL);
    const authRefreshLink = createAuthRefreshLink(() =>
      getAuthRefreshUrl(GRAPHQL_URL),
    );

    this.client = new ApolloClient({
      link: authRefreshLink.concat(
        authLink.concat(
          new HttpLink({ uri: GRAPHQL_URL, credentials: "include" }),
        ),
      ),
      cache: new InMemoryCache(),
    });
  }

  async createDraftApplication(input: CreateDraftApplicationInput) {
    return await this.client.mutate({
      mutation: CreateDraftApplicationDocument,
      variables: { input },
    });
  }
}

function getAuthRefreshUrl(graphqlUrl: string): string {
  const url = new URL(graphqlUrl);
  url.pathname = "/auth/refresh";
  url.search = "";
  url.hash = "";
  return url.toString();
}
