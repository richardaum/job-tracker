import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createApolloClient } from "@/lib/make-apollo-client";

import HomePage from "./page";

const useCurrentUserMock = vi.fn();
const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => useCurrentUserMock() }));

function renderPage() {
  return render(
    <ApolloNextAppProvider makeClient={createApolloClient}>
      <HomePage />
    </ApolloNextAppProvider>,
  );
}

describe("HomePage", () => {
  it("renders the landing page for signed-out visitors, with a Google sign-in CTA", () => {
    usePathnameMock.mockReturnValue("/");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /one pipeline/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /sign in with google/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("stays visible for signed-in visitors, swapping the CTA for a link to their jobs", () => {
    usePathnameMock.mockReturnValue("/");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useCurrentUserMock.mockReturnValue({ user: { id: "user-1" }, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /one pipeline/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /go to your jobs/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /sign in with google/i })).not.toBeInTheDocument();
  });

  it("shows the Google sign-in CTA while the session is still loading", () => {
    usePathnameMock.mockReturnValue("/");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useCurrentUserMock.mockReturnValue({ user: null, loading: true, error: undefined });

    renderPage();

    expect(screen.getAllByRole("button", { name: /sign in with google/i }).length).toBeGreaterThan(0);
  });
});
