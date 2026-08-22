import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import IdentityTabPage from "./IdentityTabPage";

const useMeQueryMock = vi.fn();

vi.mock("@/gql/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, useMeQuery: () => useMeQueryMock() };
});

function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    loading: false,
    data: {
      me: {
        __typename: "UserType" as const,
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        avatarUrl: "https://example.com/avatar.jpg",
        authProviders: ["google"],
        ...overrides,
      },
    },
  };
}

describe("IdentityTabPage", () => {
  it("shows avatar Image when avatarUrl present", () => {
    useMeQueryMock.mockReturnValue(mockUser());
    render(<IdentityTabPage />);
    const img = screen.getByAltText("John Doe");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src");
  });

  it("shows initials circle when avatarUrl is null", () => {
    useMeQueryMock.mockReturnValue(mockUser({ avatarUrl: null }));
    render(<IdentityTabPage />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows user name, email, and provider", () => {
    useMeQueryMock.mockReturnValue(mockUser());
    render(<IdentityTabPage />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("hides provider field when Better Auth has no linked providers", () => {
    useMeQueryMock.mockReturnValue(mockUser({ authProviders: [] }));
    render(<IdentityTabPage />);
    expect(screen.queryByText("Google")).not.toBeInTheDocument();
  });

  it("shows loading indicator when loading", () => {
    useMeQueryMock.mockReturnValue({ loading: true, data: undefined });
    render(<IdentityTabPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("returns null when user is null and not loading", () => {
    useMeQueryMock.mockReturnValue({ loading: false, data: { me: null } });
    render(<IdentityTabPage />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("returns null when data is undefined and not loading", () => {
    useMeQueryMock.mockReturnValue({ loading: false, data: undefined });
    render(<IdentityTabPage />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
