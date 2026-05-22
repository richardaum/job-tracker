import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import JobsPage from "./JobsPage";

const useJobsQueryMock = vi.fn();
const useJobStageEventsQueryMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => (
    <span data-testid="mock-image" aria-label={props.alt ?? ""} />
  ),
}));

vi.mock("@/gql/hooks", () => ({
  JobQuickFilter: {
    Active: "ACTIVE",
    Applied: "APPLIED",
    Incoming: "INCOMING",
    New: "NEW",
    Duplicated: "DUPLICATED",
  },
  JobSource: {
    Jack: "JACK",
    Linkedin: "LINKEDIN",
    RemoteYeah: "REMOTE_YEAH",
    Wellfound: "WELLFOUND",
  },
  JobStage: {
    New: "NEW",
    Duplicated: "DUPLICATED",
    Applied: "APPLIED",
    RecruiterScreen: "RECRUITER_SCREEN",
    Technical: "TECHNICAL",
    Offer: "OFFER",
    Rejected: "REJECTED",
  },
  SalaryPeriod: { Year: "YEAR", Month: "MONTH", Hour: "HOUR" },
  useJobsQuery: (...args: unknown[]) => useJobsQueryMock(...args),
  useJobStageEventsQuery: (...args: unknown[]) =>
    useJobStageEventsQueryMock(...args),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

vi.mock("../components/JobQuickEditDialog", () => ({
  JobQuickEditDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

vi.mock("../components/DeleteJobDialog", () => ({
  DeleteJobDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

vi.mock("../components/JobTrackingPanel", () => ({
  JobTrackingPanel: () => <div>Tracking panel</div>,
}));

vi.mock("@/modules/jobs/details/components/SalaryEditDialog", () => ({
  SalaryEditDialog: () => null,
}));

describe("JobsPage", () => {
  it("renders current stage from job when list includes currentStage", () => {
    useJobStageEventsQueryMock.mockImplementation(
      (options: { variables?: { jobId: string }; skip?: boolean } = {}) => {
        if (options.skip) {
          return { data: undefined, loading: false, error: undefined };
        }
        return {
          data: { jobStageEvents: [{ id: "event-1", toStage: "technical" }] },
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
    useJobsQueryMock.mockReturnValue({
      data: {
        jobs: [
          {
            id: "app-1",
            title: "Frontend Engineer",
            companyId: "company-1",
            company: { id: "company-1", name: "Acme" },
            description: null,
            urls: ["https://example.com"],
            createdAt: "2026-04-20T00:00:00.000Z",
            currentStage: "technical",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salary: {
              minCents: null,
              maxCents: null,
              currency: null,
              period: null,
            },
            tags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<JobsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    const postingLink = screen.getByRole("link", { name: /view posting/i });
    expect(postingLink).toBeVisible();
    expect(postingLink).toHaveAttribute("target", "_blank");
    expect(screen.getAllByText("Technical").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", {
        name: /open status history for technical/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders jobs list from query data", () => {
    useJobStageEventsQueryMock.mockImplementation(
      (options: { variables?: { jobId: string }; skip?: boolean } = {}) => {
        if (options.skip) {
          return { data: undefined, loading: false, error: undefined };
        }
        return {
          data: { jobStageEvents: [] },
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
    useJobsQueryMock.mockReturnValue({
      data: {
        jobs: [
          {
            id: "app-1",
            title: "Frontend Engineer",
            companyId: "company-1",
            company: { id: "company-1", name: "Acme" },
            description: null,
            urls: ["https://example.com"],
            createdAt: "2026-04-20T00:00:00.000Z",
            currentStage: "new",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salary: {
              minCents: null,
              maxCents: null,
              currency: null,
              period: null,
            },
            tags: [],
          },
        ],
      },
      loading: false,
      error: undefined,
    });

    render(<JobsPage />);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getAllByText("New").length).toBeGreaterThan(0);
    const postingLink = screen.getByRole("link", { name: /view posting/i });
    expect(postingLink).toBeVisible();
    expect(postingLink).toHaveAttribute("target", "_blank");
  });

  it("renders empty state when user has no jobs", () => {
    useJobStageEventsQueryMock.mockReturnValue({
      data: { jobStageEvents: [] },
    });
    useCurrentUserMock.mockReturnValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        avatarUrl: null,
      },
    });
    useJobsQueryMock.mockReturnValue({
      data: { jobs: [] },
      loading: false,
      error: undefined,
    });

    render(<JobsPage />);

    expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add your first one to start tracking/i),
    ).toBeInTheDocument();
  });
});
