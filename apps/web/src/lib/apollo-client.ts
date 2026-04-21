import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { NEXT_PUBLIC_API_GRAPHQL_URL } from "@/env/client";

export const APOLLO_GRAPHQL_URI =
  NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: APOLLO_GRAPHQL_URI,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
}

export const apolloClient = createApolloClient();
