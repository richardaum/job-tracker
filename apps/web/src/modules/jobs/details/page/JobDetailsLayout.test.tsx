import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MatchVerdict } from "@/gql/hooks";
import { MatchTabContent } from "@/modules/jobs/details/components/MatchTabContent";
import {
  completedJobMatch,
  type JobMatchData,
  mockMatchItem,
} from "@/modules/jobs/details/testing/match-tab-test-fixtures";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

import JobDetailsLayout from "./JobDetailsLayout";

const gqlMocks = vi.hoisted(() => ({
  useJobMatchQuery: vi.fn(),
  useJobQuery: vi.fn(),
  useGenerateJobMatchMutation: vi.fn(),
  useDeleteMatchAnalysisMutation: vi.fn(),
  useJobSummaryStatusChangedSubscription: vi.fn(),
  useJobFillStatusChangedSubscription: vi.fn(),
  useJobMatchStatusChangedSubscription: vi.fn(),
}));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useJobMatchQuery: gqlMocks.useJobMatchQuery,
    useJobQuery: gqlMocks.useJobQuery,
    useGenerateJobMatchMutation: gqlMocks.useGenerateJobMatchMutation,
    useDeleteMatchAnalysisMutation: gqlMocks.useDeleteMatchAnalysisMutation,
    useJobSummaryStatusChangedSubscription: gqlMocks.useJobSummaryStatusChangedSubscription,
    useJobFillStatusChangedSubscription: gqlMocks.useJobFillStatusChangedSubscription,
    useJobMatchStatusChangedSubscription: gqlMocks.useJobMatchStatusChangedSubscription,
  };
});

const lazyQueryFn = vi.fn();
vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({
    cache: {
      readFragment: vi.fn(),
      writeFragment: vi.fn(),
      readQuery: vi.fn(),
      writeQuery: vi.fn(),
      identify: vi.fn(),
      evict: vi.fn(),
    },
  }),
  useLazyQuery: () => [lazyQueryFn, { data: undefined, loading: false, error: undefined }],
}));

vi.mock("@/modules/work-preferences/components/PreferencesDialog", () => ({ PreferencesDialog: () => null }));

vi.mock("@/modules/match-analyses/details/components/MatchWizardDialog", () => ({ MatchWizardDialog: () => null }));

/** Fulfilling thenable lets `React.use(params)` unblock without suspense in jsdom tests. */
function syncParamsResolved<T>(value: T) {
  return {
    then(
      resolve: (v: T) => unknown,

      _reject?: (reason?: unknown) => void,
    ) {
      resolve(value);
      return Promise.resolve(undefined);
    },
  } as unknown as Promise<T>;
}

const useJobDetailsViewModelMock = vi.fn();
const useBreakpointMock = vi.fn();
const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => usePathnameMock(),
  useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@/hooks/useBreakpoint", () => ({ useBreakpoint: (...args: unknown[]) => useBreakpointMock(...args) }));

vi.mock("@/modules/jobs/details/hooks/useJobDetailsViewModel", () => ({
  useJobDetailsViewModel: (id: string, options?: unknown) => useJobDetailsViewModelMock(id, options),
}));

vi.mock("@/modules/jobs/details/page/JobOverviewPage", () => ({
  JobOverviewPage: () => <div data-testid="overview-tab-mock" />,
}));

vi.mock("@/modules/jobs/details/components/NotesPanel", () => ({
  NotesTabPanel: () => <div data-testid="notes-mock" />,
}));

vi.mock("@/modules/jobs/details/components/HistoryPanel", () => ({
  HistoryTabPanel: () => <div data-testid="history-mock" />,
}));

vi.mock("@/modules/jobs/details/components/ActivitySidePanelTabs", () => ({
  ActivitySidePanelTabs: () => <div data-testid="activity-mock" />,
}));

vi.mock("@/modules/jobs/details/components/ChatTabPanel", () => ({
  ChatTabPanel: () => <div data-testid="chat-mock" />,
}));

vi.mock("@/modules/jobs/details/components/UpdateStatusDialog", () => ({ UpdateStatusDialog: () => null }));

vi.mock("@/modules/jobs/list/components/DeleteJobDialog", () => ({
  DeleteJobDialog: ({ trigger }: { trigger: ReactNode }) => <div>{trigger}</div>,
}));

function setupMatchTabMocks(options: { jobMatch?: JobMatchData | undefined }) {
  gqlMocks.useJobMatchQuery.mockReturnValue({
    data: options.jobMatch ? { jobMatch: options.jobMatch } : undefined,
    loading: false,
    error: undefined,
    refetch: vi.fn().mockResolvedValue({ data: options.jobMatch ? { jobMatch: options.jobMatch } : null }),
  });
  gqlMocks.useGenerateJobMatchMutation.mockReturnValue([vi.fn().mockResolvedValue({}), { loading: false }]);
  gqlMocks.useDeleteMatchAnalysisMutation.mockReturnValue([vi.fn().mockResolvedValue({})]);
}

describe("JobDetailsLayout", () => {
  const minimalJob = {
    id: "job-1",
    title: "Engineer",
    htmlContent: null,
    match: { id: "match-1", resumeId: "resume-1" },
  } as JobDetailsValues;

  beforeEach(() => {
    vi.clearAllMocks();
    gqlMocks.useJobMatchQuery.mockReset();
    gqlMocks.useJobQuery.mockReset();
    gqlMocks.useGenerateJobMatchMutation.mockReset();
    gqlMocks.useDeleteMatchAnalysisMutation.mockReset();
    gqlMocks.useJobFillStatusChangedSubscription.mockReturnValue(undefined);
    gqlMocks.useJobSummaryStatusChangedSubscription.mockReturnValue(undefined);
    gqlMocks.useJobMatchStatusChangedSubscription.mockReturnValue(undefined);
    gqlMocks.useJobMatchQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      refetch: vi.fn().mockResolvedValue({ data: null }),
    });
    gqlMocks.useJobQuery.mockReturnValue({
      data: { job: minimalJob },
      loading: false,
      error: undefined,
      refetch: vi.fn().mockResolvedValue({ data: { job: minimalJob } }),
    });
    useBreakpointMock.mockReturnValue(false);
    usePathnameMock.mockReturnValue("/jobs/job-1");
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    useJobDetailsViewModelMock.mockReturnValue({
      job: minimalJob,
      currentStage: "NEW",
      currentStageReason: null,
      status: "success",
      displayTitle: "Engineer",
      fillButtonState: "idle",
      triggerFillAutomatically: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it("does not offer Match analysis in the Actions dropdown", async () => {
    const user = userEvent.setup();

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    const actions = screen.getByRole("button", { name: "Actions" });
    await user.click(actions);

    expect(screen.queryByRole("menuitem", { name: "Match analysis" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Fill job fields automatically" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Update status" })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Remove" })).toBeDefined();
  });

  it("lists Match alongside other primary tabs", async () => {
    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("tab", { name: "Match" })).toBeInTheDocument();

    expect(await screen.findByRole("tab", { name: "Overview" })).toBeInTheDocument();
  });

  it("selects Match tab when route is /jobs/[id]/match", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/match");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="match-child" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("tab", { name: "Match", selected: true })).toBeInTheDocument();
    expect(screen.getByTestId("match-child")).toBeInTheDocument();
  });

  it("selects Notes tab when route is /jobs/[id]/notes", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/notes");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="notes-child" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("tab", { name: "Notes", selected: true })).toBeInTheDocument();
    expect(screen.getByTestId("notes-child")).toBeInTheDocument();
  });

  it("hides ActivitySidePanel on desktop when route is /jobs/[id]/notes", async () => {
    useBreakpointMock.mockReturnValue(true);
    usePathnameMock.mockReturnValue("/jobs/job-1/notes");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="notes-child" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("tab", { name: "Notes", selected: true })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "History" })).toBeInTheDocument();
    expect(screen.queryByTestId("activity-mock")).toBeNull();
  });

  it("selects History tab and hides ActivitySidePanel on desktop /jobs/[id]/history", async () => {
    useBreakpointMock.mockReturnValue(true);
    usePathnameMock.mockReturnValue("/jobs/job-1/history");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="history-child" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("tab", { name: "History", selected: true })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "Notes" })).toBeInTheDocument();
    expect(screen.queryByTestId("activity-mock")).toBeNull();
  });

  it("shows ActivitySidePanel on desktop overview route", async () => {
    useBreakpointMock.mockReturnValue(true);
    usePathnameMock.mockReturnValue("/jobs/job-1");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByTestId("activity-mock")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Notes" })).toBeNull();
  });

  it("does not show match menu items until match tab content registers them", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/match");
    const user = userEvent.setup();

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="match-child" />
      </JobDetailsLayout>,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(screen.queryByRole("menuitem", { name: /view resume/i })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /view preferences/i })).toBeNull();
  });

  it("shows match Actions menu items when MatchTabContent is mounted on match route", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/match");
    const user = userEvent.setup();
    const items = [mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "Skill A fit" })];
    setupMatchTabMocks({ jobMatch: completedJobMatch(items) });

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <MatchTabContent jobId="job-1" />
      </JobDetailsLayout>,
    );

    expect(await screen.findByRole("button", { name: /^regenerate$/i })).toBeInTheDocument();

    expect(await screen.findByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Fits" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(screen.getByRole("menuitem", { name: /view resume/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /view preferences/i })).toBeInTheDocument();
  });

  it("preserves ?s= in desktop main tab links", async () => {
    useBreakpointMock.mockReturnValue(true);
    useSearchParamsMock.mockReturnValue(new URLSearchParams("s=history"));

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    expect(screen.getByRole("tab", { name: "Match" })).toHaveAttribute("href", "/jobs/job-1/match?s=history");
  });
});
