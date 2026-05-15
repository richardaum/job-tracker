import { serverEnv } from "@/env/server";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getServerApiBaseUrl(fallback?: string): string {
  const url = serverEnv.NEXT_PUBLIC_API_URL ?? fallback;
  return url ? trimTrailingSlash(url) : "";
}

export function getServerApiGraphqlUrl(fallback?: string): string {
  return `${getServerApiBaseUrl(fallback)}/graphql`;
}
