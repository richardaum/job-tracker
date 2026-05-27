import { ApolloLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

export function createWebSocketLink(wsUrl: string): ApolloLink {
  return new GraphQLWsLink(createClient({ url: wsUrl }));
}
