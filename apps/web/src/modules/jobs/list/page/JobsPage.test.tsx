import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import JobsPage from "./JobsPage";

const navigationMocks = { searchParams: "" };

const useJobsQueryMock = vi.fn();
const useJobStageEventsQueryMock = vi.fn();
const useCurrentUserMock = vi.fn();
const useQuickFilterCountsQueryMock = vi.fn();
const useCreateJobMutationMock = vi.fn();
const useUpdateJobMutationMock = vi.fn();
const routerPushSpy = vi.fn();
const useTourMock = vi.fn();
const useJobDataSourceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
  useRouter: () => ({ push: routerPushSpy, replace: vi.fn() }),
  usePathname: () => "/jobs",
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => <span data-testid="mock-image" aria-label={props.alt ?? ""} />,
}));

vi.mock("@/gql/hooks", () => ({
  ApplicationQuickFilter: {
    Active: "Active",
    Applied: "Applied",
    Incoming: "Incoming",
    New: "New",
    Duplicated: "Duplicated",
    Draft: "Draft",
  },
  JobSource: { Jack: "JACK", Linkedin: "LINKEDIN", RemoteYeah: "REMOTE_YEAH", Wellfound: "WELLFOUND" },
  ApplicationStage: {
    New: "New",
    Duplicated: "Duplicated",
    Applied: "Applied",
    RecruiterScreen: "RecruiterScreen",
    Technical: "Technical",
    CulturalFit: "CulturalFit",
    Offer: "Offer",
    Rejected: "Rejected",
    Draft: "Draft",
  },
  SalaryPeriod: { Year: "YEAR", Month: "MONTH", Hour: "HOUR" },
  useJobsQuery: (...args: unknown[]) => useJobsQueryMock(...args),
  useJobStageEventsQuery: (...args: unknown[]) => useJobStageEventsQueryMock(...args),
  useQuickFilterCountsQuery: (...args: unknown[]) => useQuickFilterCountsQueryMock(...args),
  JobsDocument: {},
  QuickFilterCountsDocument: {},
  useCreateJobMutation: (...args: unknown[]) => useCreateJobMutationMock(...args),
  useUpdateJobMutation: (...args: unknown[]) => useUpdateJobMutationMock(...args),
}));

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => useCurrentUserMock() }));

vi.mock("../components/JobQuickEditDialog", () => ({
  JobQuickEditDialog: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
}));

vi.mock("../components/DeleteJobDialog", () => ({
  DeleteJobDialog: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
}));

vi.mock("../components/JobTrackingPanel", () => ({ JobTrackingPanel: () => <div>Tracking panel</div> }));

vi.mock("@/modules/jobs/details/components/SalaryEditDialog", () => ({ SalaryEditDialog: () => null }));

vi.mock("@/modules/welcome-tour/WelcomeTourJobsList", () => ({ WelcomeTourJobsList: () => null }));

vi.mock("@/modules/jobs/shared/hooks/useJobDataSource", () => ({ useJobDataSource: () => useJobDataSourceMock() }));

vi.mock("@/modules/welcome-tour/useWelcomeTour", () => ({ useWelcomeTour: () => useTourMock() }));

describe("JobsPage", () => {
  beforeEach(() => {
    navigationMocks.searchParams = "";
    window.localStorage.clear();
    routerPushSpy.mockClear();
    vi.clearAllMocks();
    useQuickFilterCountsQueryMock.mockReturnValue({ data: { quickFilterCounts: [] }, loading: false });
    useCreateJobMutationMock.mockReturnValue([vi.fn(), { loading: false }]);
    useUpdateJobMutationMock.mockReturnValue([vi.fn(), { loading: false }]);
    useTourMock.mockReturnValue({ activePhase: null });
    useJobDataSourceMock.mockReturnValue("database");
  });

  it("passes DRAFT filter to Jobs query when URL has q=draft", () => {
    navigationMocks.searchParams = "q=draft";
    useJobStageEventsQueryMock.mockImplementation((options: { variables?: { jobId: string }; skip?: boolean } = {}) => {
      if (options.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });
    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    render(<JobsPage />);

    expect(useJobsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ filter: "Draft" }) }),
    );
  });

  it("falls back to INCOMING Jobs filter when URL has an unknown q token", () => {
    navigationMocks.searchParams = "q=not-a-filter";
    useJobStageEventsQueryMock.mockImplementation((options: { skip?: boolean } | undefined) => {
      if (options?.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });
    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    render(<JobsPage />);

    expect(useJobsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ filter: "Incoming" }) }),
    );
  });

  it("passes null filter when URL has q=all for unrestricted jobs list", () => {
    navigationMocks.searchParams = "q=all";
    useJobStageEventsQueryMock.mockImplementation((options: { skip?: boolean } | undefined) => {
      if (options?.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });
    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    render(<JobsPage />);

    expect(useJobsQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ filter: null }) }),
    );
  });

  it("clearing company filter removes only company from the URL", async () => {
    navigationMocks.searchParams = "q=draft&company=Acme%20Labs&runId=should-remain";

    useJobStageEventsQueryMock.mockImplementation((options: { skip?: boolean } | undefined) => {
      if (options?.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });

    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });

    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    const user = userEvent.setup();
    render(<JobsPage />);

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(routerPushSpy).toHaveBeenCalledTimes(1);

    const target = routerPushSpy.mock.calls[0][0] as string;
    expect(target.startsWith("/jobs")).toBe(true);
    const u = new URL(target, "http://localhost/");
    expect(u.searchParams.has("company")).toBe(false);
    expect(u.searchParams.get("q")).toBe("draft");
    expect(u.searchParams.get("runId")).toBe("should-remain");
  });

  it("clearing runId filter preserves q and unrelated params", async () => {
    navigationMocks.searchParams = "company=PinnedCo&q=all&runId=run-z";

    useJobStageEventsQueryMock.mockImplementation((options: { skip?: boolean } | undefined) => {
      if (options?.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });

    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });

    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    const user = userEvent.setup();
    render(<JobsPage />);

    await user.click(screen.getByRole("button", { name: /clear run filter/i }));

    expect(routerPushSpy).toHaveBeenCalledTimes(1);

    const target = routerPushSpy.mock.calls[0][0] as string;
    const u = new URL(target, "http://localhost/");
    expect(u.searchParams.has("runId")).toBe(false);
    expect(u.searchParams.get("company")).toBe("PinnedCo");
    expect(u.searchParams.get("q")).toBe("all");
  });

  it("renders current stage from job when list includes currentStage", () => {
    useJobStageEventsQueryMock.mockImplementation((options: { variables?: { jobId: string }; skip?: boolean } = {}) => {
      if (options.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [{ id: "event-1", toStage: "Technical" }] }, loading: false, error: undefined };
    });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
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
            currentStage: "Technical",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salary: { minCents: null, maxCents: null, currency: null, period: null },
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
    expect(screen.getByRole("button", { name: /open status history for technical/i })).toBeInTheDocument();
  });

  it("renders jobs list from query data", () => {
    useJobStageEventsQueryMock.mockImplementation((options: { variables?: { jobId: string }; skip?: boolean } = {}) => {
      if (options.skip) {
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: { jobStageEvents: [] }, loading: false, error: undefined };
    });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
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
            currentStage: "New",
            currentStageReason: null,
            currentStageAt: "2026-04-20T00:00:00.000Z",
            salary: { minCents: null, maxCents: null, currency: null, period: null },
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

  it("shows the created tutorial job and sample jobs after selecting Active", () => {
    navigationMocks.searchParams = "q=active";
    useTourMock.mockReturnValue({ activePhase: "jobs-list" });
    useJobDataSourceMock.mockReturnValue("local");
    window.localStorage.setItem(
      "job-tracker:welcome-tour-job-draft:v1",
      JSON.stringify({
        id: "welcome-tour-job",
        title: "My new role",
        company: "Acme",
        createdAt: "2026-08-12T14:00:00.000Z",
        stageEvents: [
          {
            id: "welcome-tour-stage-event-1",
            fromStage: "Applied",
            toStage: "RecruiterScreen",
            reason: null,
            scheduledAt: "2026-08-15T14:00:00.000Z",
            createdAt: "2026-08-12T14:00:00.000Z",
          },
        ],
      }),
    );
    useJobStageEventsQueryMock.mockReturnValue({ data: { jobStageEvents: [] }, loading: false, error: undefined });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });
    useJobsQueryMock.mockReturnValue({ data: undefined, loading: false, error: undefined });

    render(<JobsPage />);

    expect(screen.getByText("My new role")).toBeInTheDocument();
    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Product Engineer")).toBeInTheDocument();
    expect(screen.getByText("Full-stack Engineer")).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "My new role",
      "Senior Frontend Engineer",
      "Product Engineer",
      "Full-stack Engineer",
    ]);
    expect(useJobsQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it.each(["job-creation", "job-details", "job-description", "update-status", "status-history"])(
    "shows no real jobs during the %s welcome-tour phase",
    (activePhase) => {
      useTourMock.mockReturnValue({ activePhase });
      useJobDataSourceMock.mockReturnValue("local");
      useJobStageEventsQueryMock.mockReturnValue({ data: { jobStageEvents: [] }, loading: false, error: undefined });
      useCurrentUserMock.mockReturnValue({
        user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
      });
      useJobsQueryMock.mockReturnValue({
        data: { jobs: [{ id: "existing-job", title: "Existing job", company: { id: "company-1", name: "Acme" } }] },
        loading: false,
        error: undefined,
      });

      render(<JobsPage />);

      expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument();
      expect(screen.queryByText("Existing job")).not.toBeInTheDocument();
      expect(useJobsQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    },
  );

  it("renders empty state when user has no jobs", () => {
    useJobStageEventsQueryMock.mockReturnValue({ data: { jobStageEvents: [] } });
    useCurrentUserMock.mockReturnValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", avatarUrl: null },
    });
    useJobsQueryMock.mockReturnValue({ data: { jobs: [] }, loading: false, error: undefined });

    render(<JobsPage />);

    expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first one to start tracking/i)).toBeInTheDocument();
  });
});
