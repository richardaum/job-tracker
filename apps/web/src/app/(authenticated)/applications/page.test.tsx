import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "./page";

const useApplicationsQueryMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@/gql/hooks", () => ({
  useApplicationsQuery: (...args: unknown[]) =>
    useApplicationsQueryMock(...args),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

vi.mock("./ApplicationFormDialog", () => ({
  ApplicationFormDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

vi.mock("./DeleteApplicationDialog", () => ({
  DeleteApplicationDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

describe("ApplicationsPage", () => {
  it("renders applications list from query data", () => {
    useCurrentUserMock.mockReturnValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      },
    });
    useApplicationsQueryMock.mockReturnValue({
      data: {
        applications: [
          {
            id: "app-1",
            title: "Frontend Engineer",
            company: "Acme",
            url: "https://example.com",
            appliedAt: "2026-04-20T00:00:00.000Z",
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(screen.getByText("Applications")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view posting/i })).toBeVisible();
  });

  it("renders empty state when user has no applications", () => {
    useCurrentUserMock.mockReturnValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      },
    });
    useApplicationsQueryMock.mockReturnValue({
      data: { applications: [] },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(
      screen.getByText(/no applications yet\. add your first one!/i),
    ).toBeInTheDocument();
  });
});
