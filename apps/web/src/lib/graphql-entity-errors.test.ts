import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { describe, expect, it } from "vitest";

import { hasGraphQLCode } from "./graphql-entity-errors";

describe("hasGraphQLCode", () => {
  it("returns true for NOT_FOUND code", () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: "Resource not found", extensions: { code: "NOT_FOUND" } }],
    });
    expect(hasGraphQLCode(error, "NOT_FOUND")).toBe(true);
  });

  it("returns false for a different code", () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [
        {
          message: "Something went wrong",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        },
      ],
    });
    expect(hasGraphQLCode(error, "NOT_FOUND")).toBe(false);
  });

  it("returns false when there is no error", () => {
    expect(hasGraphQLCode(undefined, "NOT_FOUND")).toBe(false);
    expect(hasGraphQLCode(null, "NOT_FOUND")).toBe(false);
  });

  it("returns false for transport-level errors without graphQLErrors", () => {
    expect(hasGraphQLCode(new TypeError("Failed to fetch"), "NOT_FOUND")).toBe(false);
  });

  it("handles ApolloError with graphQLErrors", () => {
    expect(
      hasGraphQLCode(
        {
          graphQLErrors: [{ extensions: { code: "NOT_FOUND" } }],
          networkError: null,
        },
        "NOT_FOUND",
      ),
    ).toBe(true);
  });
});
