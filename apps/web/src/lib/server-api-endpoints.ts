import { serverEnv } from "@/env/server";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getServerApiBaseUrl(): string {
  return trimTrailingSlash(serverEnv.NEXT_PUBLIC_API_URL);
}

export function getServerApiGraphqlUrl(): string {
  return `${getServerApiBaseUrl()}/graphql`;
}
