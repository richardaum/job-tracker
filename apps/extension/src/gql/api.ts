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

function createFetchWithAuth(): typeof fetch {
  const cookieOrigin = new URL(GRAPHQL_URL).origin;

  return async function fetchWithAuth(url, init) {
    const token = await getAccessTokenFromCookie(cookieOrigin);
    const res = await fetch(url, {
      ...init,
      headers: { ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: "include",
    });

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
    return fetch(url, {
      ...init,
      headers: { ...init?.headers, ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}) },
      credentials: "include",
    });
  };
}

const client = new GraphQLClient(GRAPHQL_URL, { fetch: createFetchWithAuth() });

export const api = getSdk(client);
export type Api = typeof api;
