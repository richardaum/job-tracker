import { GraphQLClient } from "graphql-request";

import { getSdk, type Sdk } from "@/gql/sdk";

export function createServerSdk(url: string, cookieHeader?: string): Sdk {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  const client = new GraphQLClient(url, { headers });

  return getSdk(client);
}
