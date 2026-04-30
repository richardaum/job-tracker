import { NEXT_PUBLIC_API_GRAPHQL_URL, NEXT_PUBLIC_API_URL } from "@/env/client";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  if (NEXT_PUBLIC_API_URL) {
    return trimTrailingSlash(NEXT_PUBLIC_API_URL);
  }

  if (NEXT_PUBLIC_API_GRAPHQL_URL) {
    const graphqlUrl = trimTrailingSlash(NEXT_PUBLIC_API_GRAPHQL_URL);
    if (graphqlUrl.endsWith("/graphql")) {
      return graphqlUrl.slice(0, -"/graphql".length);
    }
  }

  return "";
}

export function getApiGraphqlUrl(): string {
  return NEXT_PUBLIC_API_GRAPHQL_URL ?? `${getApiBaseUrl()}/graphql`;
}
