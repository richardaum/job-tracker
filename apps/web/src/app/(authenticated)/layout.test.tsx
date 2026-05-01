import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProtectedLayout from "./layout";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/applications",
  useSearchParams: () => new URLSearchParams("status=OPEN"),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

describe("ProtectedLayout", () => {
  it("redirects unauthenticated users to /login with returnTo", () => {
    useCurrentUserMock.mockReturnValue({
      user: null,
      loading: false,
      error: undefined,
    });

    render(
      <ProtectedLayout>
        <div>Private Area</div>
      </ProtectedLayout>,
    );

    expect(replaceMock).toHaveBeenCalledWith(
      "/login?returnTo=%2Fapplications%3Fstatus%3DOPEN",
    );
  });

  it("renders children when authenticated", () => {
    useCurrentUserMock.mockReturnValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      },
      loading: false,
      error: undefined,
    });

    render(
      <ProtectedLayout>
        <div>Private Area</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Private Area")).toBeInTheDocument();
  });
});
