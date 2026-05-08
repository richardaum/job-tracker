"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { createAuthRefreshLink } from "@job-tracker/auth";

import { NODE_ENV } from "@/env/client";

import { getApiBaseUrl, getApiGraphqlUrl } from "./api-endpoints";

export const APOLLO_GRAPHQL_URI = getApiGraphqlUrl();
const authRefreshLink = createAuthRefreshLink(
  () => `${getApiBaseUrl()}/auth/refresh`,
);

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: getApiGraphqlUrl(),
    credentials: "include",
    // fetch: async (uri, options) => {
    //   const bodyText = typeof options?.body === "string" ? options.body : "";
    //   const isCreateWithAiV2 = bodyText.includes("createApplicationWithAIV2");
    //   const resolvedUri =
    //     isCreateWithAiV2 && String(uri) === "/graphql"
    //       ? typeof window !== "undefined"
    //         ? `${window.location.protocol}//${window.location.hostname}:3101/graphql`
    //         : "http://127.0.0.1:3101/graphql"
    //       : uri;
    //   return fetch(resolvedUri, options);
    // },
  });

  return new ApolloClient({
    link: authRefreshLink.concat(httpLink),
    cache: new InMemoryCache(),
    devtools: { enabled: NODE_ENV === "development" },
  });
}

export const apolloClient = createApolloClient();
