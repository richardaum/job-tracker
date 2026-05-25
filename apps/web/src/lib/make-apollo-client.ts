"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { clientEnv } from "@/env/client";

import { getApiBaseUrl, getApiGraphqlUrl } from "./api-endpoints";

export const APOLLO_GRAPHQL_URI = getApiGraphqlUrl();

export function createApolloClient() {
  const authRefreshLink = createAuthRefreshLink(
    () => `${getApiBaseUrl()}/auth/refresh`,
  );
  const httpLink = new HttpLink({
    uri: getApiGraphqlUrl(),
    credentials: "include",
  });

  return new ApolloClient({
    link: authRefreshLink.concat(httpLink),
    cache: new InMemoryCache(),
    devtools: { enabled: clientEnv.NODE_ENV === "development" },
  });
}
