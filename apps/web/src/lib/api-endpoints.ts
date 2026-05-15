import { NEXT_PUBLIC_API_URL } from "@/env/client";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  return NEXT_PUBLIC_API_URL ? trimTrailingSlash(NEXT_PUBLIC_API_URL) : "";
}

export function getApiGraphqlUrl(): string {
  return `${getApiBaseUrl()}/graphql`;
}
