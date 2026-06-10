import { GraphQLClient } from "graphql-request";
import { tryRun } from "@job-tracker/try-run";

import { getSdk } from "@/gql/apiClient";
import { getAccessTokenFromCookie } from "@/domains/api/get-access-token-from-cookie";

const API_URL = import.meta.env.WXT_PUBLIC_API_URL ?? "http://localhost:3101";
const GRAPHQL_URL = `${API_URL}/graphql`;

const authRefreshCallbacks: Array<(success: boolean) => void> = [];

export function onAuthRefresh(callback: (success: boolean) => void): void {
  authRefreshCallbacks.push(callback);
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const url = new URL(GRAPHQL_URL);
  url.pathname = "/auth/refresh";
  const [err, res] = await tryRun(
    fetch(url.toString(), { method: "POST", credentials: "include", headers: { "X-Auth-Action": "1" } }),
  );
  return !err && res.ok;
}

async function fetchWithAuth(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const cookieOrigin = new URL(GRAPHQL_URL).origin;
  const token = await getAccessTokenFromCookie(cookieOrigin);

  const headers: Record<string, string> = {};
  if (init?.headers) {
    const h = new Headers(init.headers);
    h.forEach((value, key) => {
      headers[key] = value;
    });
  }
  headers["content-type"] = "application/json";
  headers["apollo-require-preflight"] = "1";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers, credentials: "include" });

  if (res.status !== 401) return res;

  refreshPromise ??= refreshToken()
    .then((ok) => {
      authRefreshCallbacks.forEach((cb) => cb(ok));
      return ok;
    })
    .finally(() => {
      refreshPromise = null;
    });

  if (!(await refreshPromise)) return res;

  const newToken = await getAccessTokenFromCookie(cookieOrigin);
  const retryHeaders: Record<string, string> = { ...headers };
  if (newToken) retryHeaders.Authorization = `Bearer ${newToken}`;

  return fetch(url, { ...init, headers: retryHeaders, credentials: "include" });
}

const client = new GraphQLClient(GRAPHQL_URL, { fetch: fetchWithAuth });

export const api = getSdk(client);
export type Api = typeof api;
