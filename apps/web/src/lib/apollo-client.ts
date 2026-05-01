import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { getApiGraphqlUrl } from "./api-endpoints";
import { authRefreshLink } from "./auth-refresh-link";

function getApolloGraphqlUri(): string {
  return getApiGraphqlUrl();
}

export const APOLLO_GRAPHQL_URI = getApolloGraphqlUri();

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: getApolloGraphqlUri,
    credentials: "include",
  });

  return new ApolloClient({
    link: authRefreshLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export const apolloClient = createApolloClient();
