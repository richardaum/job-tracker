import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const replaceMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

describe("LoginPage", () => {
  it("renders Google login button", () => {
    useCurrentUserMock.mockReturnValue({
      user: null,
      loading: false,
      error: undefined,
    });

    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("redirects authenticated users away from /login", () => {
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      error: undefined,
    });

    render(<LoginPage />);

    expect(replaceMock).toHaveBeenCalledWith("/");
  });
});
