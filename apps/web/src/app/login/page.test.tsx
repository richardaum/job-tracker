import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApolloClient } from "@/lib/make-apollo-client";

import { LoginPageClient } from "./LoginPageClient";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();
const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => useCurrentUserMock() }));

function renderPage() {
  return render(
    <ApolloNextAppProvider makeClient={createApolloClient}>
      <LoginPageClient />
    </ApolloNextAppProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("shows a transition while it validates the OAuth session", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=%2Fjobs%2F123"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /finalizing your access/i })).toBeInTheDocument();
  });

  it("keeps the loading view visible when view=loading", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("view=loading"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /finalizing your access/i })).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to returnTo from query param", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=%2Fjobs%2F123"));
    useCurrentUserMock.mockReturnValue({ user: { id: "user-1" }, loading: false, error: undefined });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith("/jobs/123");
  });

  it("returns signed-out visitors to the landing popover", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=https%3A%2F%2Fevil.example"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith("/?signIn=open&returnTo=%2Fjobs");
  });

  it("renders the pending message and hides the login CTA when status=pending", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=pending"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /access requested/i })).toBeInTheDocument();
    expect(screen.getByText(/access checkpoint/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try signing in again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /use a different account/i })).toBeInTheDocument();
  });

  it("renders the rejected message and hides the login CTA when status=rejected", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=rejected"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /access not granted/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /use a different account/i })).toBeInTheDocument();
  });

  it("returns an unrecognized status to the landing popover", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=something-else"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith("/?signIn=open&returnTo=%2Fjobs");
  });
});
