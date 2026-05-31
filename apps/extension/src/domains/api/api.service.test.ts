import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockQuery } = vi.hoisted(() => {
  const mockQuery = vi.fn().mockResolvedValue({ data: null });
  return { mockQuery };
});

vi.mock("@apollo/client/core", () => {
  class MockApolloClient {
    query = mockQuery;
    stop = vi.fn();
  }

  return {
    ApolloClient: MockApolloClient,
    ApolloLink: { from: vi.fn() },
    HttpLink: vi.fn(),
    InMemoryCache: vi.fn(),
  };
});

vi.mock("@job-tracker/auth", () => ({ createAuthRefreshLink: vi.fn() }));

vi.mock("@/domains/api/create-extension-auth-link", () => ({
  createExtensionAuthLink: vi.fn(),
}));

vi.mock("@/gql/graphql", () => ({ IsJobDuplicateDocument: {} }));

import { ApiService } from "./api.service";

describe("ApiService", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ data: null });
  });

  describe("isJobDuplicate", () => {
    it("returns true when server responds with true", async () => {
      mockQuery.mockResolvedValue({ data: { isJobDuplicate: true } });

      const service = new ApiService();
      const result = await service.isJobDuplicate("Acme", "Engineer");

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { company: "Acme", title: "Engineer" },
        }),
      );
    });

    it("returns false when server responds with false", async () => {
      mockQuery.mockResolvedValue({ data: { isJobDuplicate: false } });

      const service = new ApiService();
      const result = await service.isJobDuplicate("Acme", "Unknown");

      expect(result).toBe(false);
    });

    it("returns false on network error", async () => {
      mockQuery.mockRejectedValue(new Error("Network error"));

      const service = new ApiService();
      const result = await service.isJobDuplicate("Acme", "Engineer");

      expect(result).toBe(false);
    });

    it("returns false when data is null", async () => {
      mockQuery.mockResolvedValue({ data: null });

      const service = new ApiService();
      const result = await service.isJobDuplicate("Acme", "Engineer");

      expect(result).toBe(false);
    });
  });
});
