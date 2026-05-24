"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { clientEnv } from "@/env/client";

import { getApiBaseUrl, getApiGraphqlUrl } from "./api-endpoints";

export const APOLLO_GRAPHQL_URI = getApiGraphqlUrl();
const authRefreshLink = createAuthRefreshLink(
  () => `${getApiBaseUrl()}/auth/refresh`,
);

export function createApolloClient() {
  const httpLink = new HttpLink({ uri: getApiGraphqlUrl() });

  return new ApolloClient({
    link: authRefreshLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: { UserSetting: { keyFields: ["userId"] } },
    }),
    devtools: { enabled: clientEnv.NODE_ENV === "development" },
  });
}

export const apolloClient = createApolloClient();
