import { CombinedGraphQLErrors } from "@apollo/client/errors";

function readGraphQLErrors(
  error: unknown,
): ReadonlyArray<{ readonly message: string; readonly extensions?: unknown }> {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors;
  }
  if (
    error &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray((error as { graphQLErrors?: unknown }).graphQLErrors)
  ) {
    return (
      error as {
        graphQLErrors: ReadonlyArray<{ message: string; extensions?: unknown }>;
      }
    ).graphQLErrors;
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
