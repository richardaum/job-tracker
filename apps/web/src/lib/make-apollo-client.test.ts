import { describe, expect, it } from "vitest";

import { APOLLO_GRAPHQL_URI, createApolloClient } from "./make-apollo-client";

describe("make-apollo-client", () => {
  it("creates Apollo client instance", () => {
    const client = createApolloClient();
    expect(client).toBeDefined();
  });

  it("defines a GraphQL endpoint URI", () => {
    expect(APOLLO_GRAPHQL_URI).toBeTruthy();
  });
});
