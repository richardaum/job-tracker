import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "./useCurrentUser";

const useMeQueryMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return {
    ...actual,
    useMeQuery: (...args: unknown[]) => useMeQueryMock(...args),
  };
});

describe("useCurrentUser", () => {
  beforeEach(() => {
    useMeQueryMock.mockReset();
  });

  it("returns current user data shape", async () => {
    const mockUser: CurrentUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      avatarUrl: null,
      accounts: [],
    };

    useMeQueryMock.mockReturnValue({
      data: { me: mockUser },
      loading: false,
      error: undefined,
    });

    const { useCurrentUser } = await import("./useCurrentUser");
    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("returns null user when unauthenticated", async () => {
    const authError = {
      graphQLErrors: [{ extensions: { code: "UNAUTHENTICATED" } }],
    };
    useMeQueryMock.mockReturnValue({
      data: { me: null },
      loading: false,
      error: authError,
    });

    const { useCurrentUser } = await import("./useCurrentUser");
    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(authError);
  });
});
