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
  useGenerateJobMatchMutation: vi.fn(),
  useDeleteMatchAnalysisMutation: vi.fn(),
}));

const sseMocks = vi.hoisted(() => ({ useEventSource: vi.fn() }));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useJobMatchQuery: gqlMocks.useJobMatchQuery,
    useGenerateJobMatchMutation: gqlMocks.useGenerateJobMatchMutation,
    useDeleteMatchAnalysisMutation: gqlMocks.useDeleteMatchAnalysisMutation,
  };
});

vi.mock("@/hooks/useEventSource", () => ({
  useEventSource: sseMocks.useEventSource,
}));

vi.mock("@/lib/api-endpoints", () => ({
  getApiBaseUrl: () => "https://api.test",
}));

vi.mock("@/modules/work-preferences/components/PreferencesDialog", () => ({
  PreferencesDialog: () => null,
}));

vi.mock(
  "@/modules/match-analyses/details/components/MatchWizardDialog",
  () => ({ MatchWizardDialog: () => null }),
);

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

vi.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: (...args: unknown[]) => useBreakpointMock(...args),
}));

vi.mock("@/modules/jobs/details/hooks/useJobDetailsViewModel", () => ({
  useJobDetailsViewModel: (id: string, options?: unknown) =>
    useJobDetailsViewModelMock(id, options),
}));

vi.mock("@/modules/jobs/details/hooks/useJobAutoFillFromQuery", () => ({
  useJobAutoFillFromQuery: vi.fn(),
}));

vi.mock("@/modules/jobs/details/page/JobOverviewPage", () => ({
  JobOverviewPage: () => <div data-testid="overview-tab-mock" />,
}));

vi.mock("@/modules/jobs/details/components/NotesPanel", () => ({
  NotesPanelTabsContent: () => <div data-testid="notes-mock" />,
}));

vi.mock("@/modules/jobs/details/components/HistoryPanel", () => ({
  HistoryPanelTabsContent: () => <div data-testid="history-mock" />,
}));

vi.mock("@/modules/jobs/details/components/ActivitySidePanel", () => ({
  ActivitySidePanel: () => <div data-testid="activity-mock" />,
}));

vi.mock("@/modules/jobs/details/components/UpdateStatusAction", () => ({
  UpdateStatusAction: () => null,
}));

vi.mock("@/modules/jobs/list/components/DeleteJobDialog", () => ({
  DeleteJobDialog: ({ trigger }: { trigger: ReactNode }) => (
    <div>{trigger}</div>
  ),
}));

function setupMatchTabMocks(options: { jobMatch?: JobMatchData | undefined }) {
  gqlMocks.useJobMatchQuery.mockReturnValue({
    data: options.jobMatch ? { jobMatch: options.jobMatch } : undefined,
    loading: false,
    error: undefined,
    refetch: vi
      .fn()
      .mockResolvedValue({
        data: options.jobMatch ? { jobMatch: options.jobMatch } : null,
      }),
  });
  gqlMocks.useGenerateJobMatchMutation.mockReturnValue([
    vi.fn().mockResolvedValue({}),
    { loading: false },
  ]);
  gqlMocks.useDeleteMatchAnalysisMutation.mockReturnValue([
    vi.fn().mockResolvedValue({}),
  ]);
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
    gqlMocks.useGenerateJobMatchMutation.mockReset();
    gqlMocks.useDeleteMatchAnalysisMutation.mockReset();
    sseMocks.useEventSource.mockReset();
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

    expect(
      screen.queryByRole("menuitem", { name: "Match analysis" }),
    ).toBeNull();
    expect(
      screen.getByRole("menuitem", { name: "Fill automatically" }),
    ).toBeDefined();
    expect(
      screen.getByRole("menuitem", { name: "Update status" }),
    ).toBeDefined();
    expect(screen.getByRole("menuitem", { name: "Remove" })).toBeDefined();
  });

  it("lists Match alongside other primary tabs", async () => {
    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    expect(
      await screen.findByRole("tab", { name: "Match" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("tab", { name: "Overview" }),
    ).toBeInTheDocument();
  });

  it("selects Match tab when route is /jobs/[id]/match", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/match");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="match-child" />
      </JobDetailsLayout>,
    );

    expect(
      await screen.findByRole("tab", { name: "Match", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("match-child")).toBeInTheDocument();
  });

  it("selects Notes tab when route is /jobs/[id]/notes", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/notes");

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="notes-child" />
      </JobDetailsLayout>,
    );

    expect(
      await screen.findByRole("tab", { name: "Notes", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("notes-child")).toBeInTheDocument();
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
    expect(
      screen.queryByRole("menuitem", { name: /view preferences/i }),
    ).toBeNull();
  });

  it("shows match Actions menu items when MatchTabContent is mounted on match route", async () => {
    usePathnameMock.mockReturnValue("/jobs/job-1/match");
    const user = userEvent.setup();
    const items = [
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "Skill A fit" }),
    ];
    setupMatchTabMocks({ jobMatch: completedJobMatch(items) });

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <MatchTabContent jobId="job-1" />
      </JobDetailsLayout>,
    );

    expect(
      await screen.findByRole("button", { name: /^regenerate$/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actions" }));

    expect(
      screen.getByRole("menuitem", { name: /view resume/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /view preferences/i }),
    ).toBeInTheDocument();
  });

  it("preserves ?s= in desktop main tab links", async () => {
    useBreakpointMock.mockReturnValue(true);
    useSearchParamsMock.mockReturnValue(new URLSearchParams("s=history"));

    render(
      <JobDetailsLayout params={syncParamsResolved({ id: "job-1" })}>
        <div data-testid="child-content" />
      </JobDetailsLayout>,
    );

    expect(screen.getByRole("tab", { name: "Match" })).toHaveAttribute(
      "href",
      "/jobs/job-1/match?s=history",
    );
  });
});
