"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { clientEnv } from "@/env/client";

import { getApiBaseUrl, getApiGraphqlUrl, getApiGraphqlWsUrl } from "./api-endpoints";
import { createWebSocketLink } from "./create-websocket-link";
import { aiBlockedLink } from "./ai-blocked-link";

export const APOLLO_GRAPHQL_URI = getApiGraphqlUrl();

export function createApolloClient() {
  const authRefreshLink = createAuthRefreshLink(() => `${getApiBaseUrl()}/auth/refresh`);
  const httpLink = new HttpLink({ uri: getApiGraphqlUrl(), credentials: "include" });
  const wsLink = createWebSocketLink(getApiGraphqlWsUrl());
  const transportLink = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    link: aiBlockedLink.concat(authRefreshLink.concat(transportLink)),
    cache: new InMemoryCache(),
    devtools: { enabled: clientEnv.NODE_ENV === "development" },
  });
}
