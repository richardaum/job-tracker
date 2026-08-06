import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createApolloClient } from "@/lib/make-apollo-client";
import { AuthenticatedLayout } from "@/modules/navigation/layouts/AuthenticatedLayout";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams("status=OPEN"),
}));

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => useCurrentUserMock() }));

vi.mock("posthog-js/react", () => ({ usePostHog: () => ({ identify: vi.fn() }), useFeatureFlagEnabled: () => true }));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useSettingsQuery: () => ({ data: undefined, refetch: vi.fn() }),
    useAiUsageChangedSubscription: () => undefined,
  };
});

function renderAuthenticatedLayout(children: ReactNode) {
  return render(
    <ApolloNextAppProvider makeClient={createApolloClient}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </ApolloNextAppProvider>,
  );
}

describe("AuthenticatedLayout", () => {
  it("redirects unauthenticated users to /login with returnTo", () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: false, error: undefined });

    renderAuthenticatedLayout(<div>Private Area</div>);

    expect(replaceMock).toHaveBeenCalledWith("/login?returnTo=%2Fjobs%3Fstatus%3DOPEN");
  });

  it("renders children when authenticated", () => {
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
      loading: false,
      error: undefined,
    });

    renderAuthenticatedLayout(<div>Private Area</div>);

    expect(screen.getByText("Private Area")).toBeInTheDocument();
  });
});
