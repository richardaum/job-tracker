import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ApplicationsPage from "./ApplicationsPage";

const useApplicationsQueryMock = vi.fn();
const useApplicationStageEventsQueryMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@/gql/hooks", () => ({
  ApplicationQuickFilter: {
    Active: "ACTIVE",
    Applied: "APPLIED",
    Incoming: "INCOMING",
    New: "NEW",
  },
  ApplicationSource: {
    Jack: "JACK",
    Linkedin: "LINKEDIN",
    Wellfound: "WELLFOUND",
  },
  ApplicationStage: {
    New: "new",
    Applied: "applied",
    RecruiterScreen: "recruiter_screen",
    Technical: "technical",
    Offer: "offer",
    Rejected: "rejected",
  },
  SalaryPeriod: { Year: "YEAR", Month: "MONTH", Hour: "HOUR" },
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

vi.mock(
  "@/modules/applications/details/components/CompensationEditDialog",
  () => ({ CompensationEditDialog: () => null }),
);

describe("ApplicationsPage", () => {
  it("renders current stage from application when list includes currentStage", () => {
    useApplicationStageEventsQueryMock.mockImplementation(
      (
        options: { variables?: { applicationId: string }; skip?: boolean } = {},
      ) => {
        if (options.skip) {
          return { data: undefined, loading: false, error: undefined };
        }
        return {
          data: {
            applicationStageEvents: [{ id: "event-1", toStage: "technical" }],
          },
          loading: false,
          error: undefined,
        };
      },
    );
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
            companyId: "company-1",
            company: { id: "company-1", name: "Acme" },
            description: null,
            url: "https://example.com",
            createdAt: "2026-04-20T00:00:00.000Z",
            currentStage: "technical",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salaryMinCents: null,
            salaryMaxCents: null,
            salaryCurrency: null,
            salaryPeriod: null,
            tags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view posting/i })).toBeVisible();
    expect(screen.getAllByText("Technical").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", {
        name: /open status history for technical/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders applications list from query data", () => {
    useApplicationStageEventsQueryMock.mockImplementation(
      (
        options: { variables?: { applicationId: string }; skip?: boolean } = {},
      ) => {
        if (options.skip) {
          return { data: undefined, loading: false, error: undefined };
        }
        return {
          data: { applicationStageEvents: [] },
          loading: false,
          error: undefined,
        };
      },
    );
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
            companyId: "company-1",
            company: { id: "company-1", name: "Acme" },
            description: null,
            url: "https://example.com",
            createdAt: "2026-04-20T00:00:00.000Z",
            currentStage: "new",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salaryMinCents: null,
            salaryMaxCents: null,
            salaryCurrency: null,
            salaryPeriod: null,
            tags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<ApplicationsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getAllByText("New").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /view posting/i })).toBeVisible();
  });

  it("renders empty state when user has no applications", () => {
    useApplicationStageEventsQueryMock.mockReturnValue({
      data: { applicationStageEvents: [] },
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
