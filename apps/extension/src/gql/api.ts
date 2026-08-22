import { GraphQLClient } from "graphql-request";

import { getSdk } from "@/gql/apiClient";

const API_URL = import.meta.env.WXT_PUBLIC_API_URL ?? "http://localhost:3101";
const GRAPHQL_URL = `${API_URL}/graphql`;

async function fetchWithAuth(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {};
  if (init?.headers) {
    const h = new Headers(init.headers);
    h.forEach((value, key) => {
      headers[key] = value;
    });
  }
  headers["content-type"] = "application/json";
  headers["apollo-require-preflight"] = "1";
  return fetch(url, { ...init, headers, credentials: "include" });
}

const client = new GraphQLClient(GRAPHQL_URL, { fetch: fetchWithAuth });

export const api = getSdk(client);
export type Api = typeof api;
