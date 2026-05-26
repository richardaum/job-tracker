import { clientEnv } from "@/env/client";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  return clientEnv.NEXT_PUBLIC_API_URL
    ? trimTrailingSlash(clientEnv.NEXT_PUBLIC_API_URL)
    : "";
}

export function getApiGraphqlUrl(): string {
  return `${getApiBaseUrl()}/graphql`;
}

export function getApiGraphqlSseUrl(): string {
  return `${getApiBaseUrl()}/graphql-sse/stream`;
}
