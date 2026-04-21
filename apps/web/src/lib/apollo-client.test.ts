import { describe, expect, it, vi } from "vitest";

const apolloClientSpy = vi.fn();
const httpLinkSpy = vi.fn();
const inMemoryCacheSpy = vi.fn();

vi.mock("@apollo/client", () => ({
  ApolloClient: function ApolloClient(options: unknown) {
    apolloClientSpy(options);
    return options;
  },
  HttpLink: function HttpLink(options: unknown) {
    httpLinkSpy(options);
    return options;
  },
  InMemoryCache: function InMemoryCache() {
    inMemoryCacheSpy();
    return {};
  },
}));

describe("apollo-client", () => {
  it("creates ApolloClient with HttpLink credentials include", async () => {
    const { APOLLO_GRAPHQL_URI, createApolloClient } =
      await import("./apollo-client");

    createApolloClient();

    expect(httpLinkSpy).toHaveBeenCalledWith({
      uri: APOLLO_GRAPHQL_URI,
      credentials: "include",
    });
    expect(inMemoryCacheSpy).toHaveBeenCalled();
    expect(apolloClientSpy).toHaveBeenCalled();
  });
});
