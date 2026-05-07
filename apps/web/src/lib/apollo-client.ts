"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { getApiBaseUrl, getApiGraphqlUrl } from "./api-endpoints";

function getApolloGraphqlUri(): string {
  return getApiGraphqlUrl();
}

export const APOLLO_GRAPHQL_URI = getApolloGraphqlUri();
const authRefreshLink = createAuthRefreshLink(
  () => `${getApiBaseUrl()}/auth/refresh`,
);

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
