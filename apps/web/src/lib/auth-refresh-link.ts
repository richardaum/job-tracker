import { Observable } from "@apollo/client/core";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";

import { getApiBaseUrl } from "./api-endpoints";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function isUnauthorizedError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some(
      (graphqlError) => graphqlError.extensions?.code === "UNAUTHENTICATED",
    );
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeNetworkError = error as {
    statusCode?: number;
    status?: number;
    response?: { status?: number };
  };

  const statusCode =
    maybeNetworkError.statusCode ??
    maybeNetworkError.status ??
    maybeNetworkError.response?.status;
  return statusCode === 401;
}

export const authRefreshLink = new ErrorLink(
  ({ error, operation, forward }) => {
    const alreadyRetried = operation.getContext().didRefreshRetry === true;
    if (alreadyRetried || !isUnauthorizedError(error)) {
      return;
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const currentRefreshPromise = refreshPromise;

    return new Observable((observer) => {
      let subscription: { unsubscribe: () => void } | undefined;

      void currentRefreshPromise
        .then((refreshSucceeded) => {
          if (!refreshSucceeded) {
            observer.error(error);
            return;
          }

          operation.setContext({
            ...operation.getContext(),
            didRefreshRetry: true,
          });

          subscription = forward(operation).subscribe({
            next: (value) => observer.next(value),
            error: (networkError) => observer.error(networkError),
            complete: () => observer.complete(),
          });
        })
        .catch((refreshError) => {
          observer.error(refreshError);
        });

      return () => {
        subscription?.unsubscribe();
      };
    });
  },
);
