import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { NEXT_PUBLIC_API_GRAPHQL_URL } from "@/env/client";
import { authRefreshLink } from "./auth-refresh-link";

export const APOLLO_GRAPHQL_URI =
  NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: APOLLO_GRAPHQL_URI,
    credentials: "include",
  });

  return new ApolloClient({
    link: authRefreshLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export const apolloClient = createApolloClient();
