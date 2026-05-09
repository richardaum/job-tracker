import { Observable } from "@apollo/client/core";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { tryRun } from "@job-tracker/try-run";

type RefreshUrlProvider = () => string;

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(refreshUrl: string): Promise<boolean> {
  const [err, response] = await tryRun(
    fetch(refreshUrl, { method: "POST", credentials: "include" }),
  );
  if (err) {
    return false;
  }
  return response.ok;
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

export function createAuthRefreshLink(getRefreshUrl: RefreshUrlProvider) {
  return new ErrorLink(({ error, operation, forward }) => {
    const alreadyRetried = operation.getContext().didRefreshRetry === true;
    if (alreadyRetried || !isUnauthorizedError(error)) {
      return;
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(getRefreshUrl()).finally(() => {
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
  });
}
