import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "./page";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();
const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

describe("LoginPage", () => {
  it("renders Google login button", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("returnTo=%2Fjobs%2F123"),
    );
    useCurrentUserMock.mockReturnValue({
      user: null,
      loading: false,
      error: undefined,
    });

    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /get started/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /job tracker highlights/i }),
    ).toBeInTheDocument();
  });

  it("redirects authenticated users to returnTo from query param", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("returnTo=%2Fjobs%2F123"),
    );
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      error: undefined,
    });

    render(<LoginPage />);

    expect(replaceMock).toHaveBeenCalledWith("/jobs/123");
  });

  it("falls back to home for unsafe returnTo", () => {
    usePathnameMock.mockReturnValue("/login");
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("returnTo=https%3A%2F%2Fevil.example"),
    );
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      error: undefined,
    });

    render(<LoginPage />);

    expect(replaceMock).toHaveBeenCalledWith("/");
  });
});
