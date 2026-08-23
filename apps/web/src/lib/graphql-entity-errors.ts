import { CombinedGraphQLErrors } from "@apollo/client/errors";

function readGraphQLErrors(error: unknown): ReadonlyArray<{ readonly message: string; readonly extensions?: unknown }> {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors;
  }
  if (
    error &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray((error as { graphQLErrors?: unknown }).graphQLErrors)
  ) {
    return (error as { graphQLErrors: ReadonlyArray<{ message: string; extensions?: unknown }> }).graphQLErrors;
  }
  return [];
}

export function hasGraphQLCode(error: unknown, code: string): boolean {
  const gqlErrors = readGraphQLErrors(error);
  return gqlErrors.some((e) => {
    const ext = e.extensions as Record<string, unknown> | undefined;
    return ext?.code === code;
  });
}

// SessionAuthGuard throws UnauthorizedException({ userStatus }) for non-active accounts.
// @nestjs/apollo copies that payload verbatim into extensions.originalError.
export function getAuthUserStatus(error: unknown): string | undefined {
  for (const e of readGraphQLErrors(error)) {
    const ext = e.extensions as Record<string, unknown> | undefined;
    const originalError = ext?.originalError as Record<string, unknown> | undefined;
    const userStatus = originalError?.userStatus;
    if (typeof userStatus === "string") return userStatus;
  }
  return undefined;
}
