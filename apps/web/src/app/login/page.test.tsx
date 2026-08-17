import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      <LoginPageClient loginV2Enabled={false} />
    </ApolloNextAppProvider>,
  );
}

describe("LoginPage", () => {
  it("renders Google login button", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=%2Fjobs%2F123"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /job tracker highlights/i })).toBeInTheDocument();
  });

  it("redirects authenticated users to returnTo from query param", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=%2Fjobs%2F123"));
    useCurrentUserMock.mockReturnValue({ user: { id: "user-1" }, loading: false, error: undefined });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith("/jobs/123");
  });

  it("falls back to home for unsafe returnTo", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("returnTo=https%3A%2F%2Fevil.example"));
    useCurrentUserMock.mockReturnValue({ user: { id: "user-1" }, loading: false, error: undefined });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("renders the pending message and hides the login CTA when status=pending", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=pending"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /access requested/i })).toBeInTheDocument();
    expect(screen.getByText(/pending admin approval/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("renders the rejected message and hides the login CTA when status=rejected", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=rejected"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("heading", { name: /access not granted/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("falls back to the default login CTA for an unrecognized status value", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(new URLSearchParams("status=something-else"));
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderPage();

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  describe("logging out from the pending screen", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
      usePathnameMock.mockReturnValue("/login");
      useSearchParamsMock.mockReturnValue(new URLSearchParams("status=pending"));
      useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });
      fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("calls the logout endpoint and redirects to /login", async () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: /log out/i }));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining("/auth/logout"),
          expect.objectContaining({ method: "POST", credentials: "include" }),
        );
        expect(replaceMock).toHaveBeenCalledWith("/login");
      });
    });
  });
});
