import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "./ApplicationsPage";

const useApplicationsQueryMock = vi.fn();
const useApplicationStageEventsQueryMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@/gql/hooks", () => ({
  ApplicationStage: {
    New: "new",
    Applied: "applied",
    RecruiterScreen: "recruiter_screen",
    Technical: "technical",
    Offer: "offer",
    Rejected: "rejected",
  },
  SalaryPeriod: {
    Year: "YEAR",
    Month: "MONTH",
    Hour: "HOUR",
  },
  useApplicationsQuery: (...args: unknown[]) =>
    useApplicationsQueryMock(...args),
  useApplicationStageEventsQuery: (...args: unknown[]) =>
    useApplicationStageEventsQueryMock(...args),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

vi.mock("../components/ApplicationQuickEditModal", () => ({
  ApplicationQuickEditModal: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

vi.mock("../components/DeleteApplicationDialog", () => ({
  DeleteApplicationDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

vi.mock("../components/ApplicationTrackingPanel", () => ({
  ApplicationTrackingPanel: () => <div>Tracking panel</div>,
}));

describe("ApplicationsPage", () => {
  it("renders current stage badge when stage events exist", () => {
    useApplicationStageEventsQueryMock.mockReturnValue({
      data: {
        applicationStageEvents: [{ id: "event-1", toStage: "technical" }],
      },
    });
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
            description: null,
            url: "https://example.com",
            createdAt: "2026-04-20T00:00:00.000Z",
            salaryMinCents: null,
            salaryMaxCents: null,
            salaryCurrency: null,
            salaryPeriod: null,
            salaryTags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view posting/i })).toBeVisible();
  });

  it("renders applications list from query data", () => {
    useApplicationStageEventsQueryMock.mockReturnValue({
      data: {
        applicationStageEvents: [],
      },
    });
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
            description: null,
            url: "https://example.com",
            createdAt: "2026-04-20T00:00:00.000Z",
            salaryMinCents: null,
            salaryMaxCents: null,
            salaryCurrency: null,
            salaryPeriod: null,
            salaryTags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view posting/i })).toBeVisible();
  });

  it("renders empty state when user has no applications", () => {
    useApplicationStageEventsQueryMock.mockReturnValue({
      data: {
        applicationStageEvents: [],
      },
    });
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
