import { Button, DropdownMenu } from "@job-tracker/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { PortalSlotsProvider } from "react-portalslots";

import type { JobMatchQuery } from "@/gql/hooks";
import {
  AsyncMetadataStatus,
  FitClassification,
  FitSource,
  FitVerdict,
  RequirementType,
} from "@/gql/hooks";
import {
  JobActionsMenuItemsOutlet,
  JobActionsMenuItemsProvider,
} from "@/modules/jobs/details/job-details-actions-menu";
import { JobHeaderActions } from "@/modules/jobs/details/job-details-header.slots";

import { MatchTabContent } from "./MatchTabContent";

type JobMatchData = NonNullable<JobMatchQuery["jobMatch"]>;

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: vi.fn() }),
}));

vi.mock("@/lib/api-endpoints", () => ({
  getApiBaseUrl: () => "https://api.test",
}));

const routerPushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushSpy }),
}));

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

vi.mock("@/modules/work-preferences/components/PreferencesDialog", () => ({
  PreferencesDialog: ({
    open,
    readOnly,
  }: {
    open: boolean;
    readOnly?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) =>
    open ? (
      <div
        role="dialog"
        aria-label="preferences-dialog"
        data-read-only={readOnly ? "true" : "false"}
      />
    ) : null,
}));

vi.mock(
  "@/modules/match-analyses/details/components/MatchWizardDialog",
  () => ({
    MatchWizardDialog: ({
      open,
      hasExistingMatch,
      generating,
      onOpenChange,
    }: {
      open: boolean;
      hasExistingMatch: boolean;
      generating?: boolean;
      onOpenChange: (next: boolean) => void;
    }) =>
      open ? (
        <div
          role="dialog"
          aria-label="match-wizard-dialog"
          data-has-existing-match={hasExistingMatch ? "true" : "false"}
          data-generating={generating ? "true" : "false"}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close wizard dialog"
          >
            Close wizard
          </button>
          mock wizard panel
        </div>
      ) : null,
  }),
);

function mockItem(partial: {
  verdict: FitVerdict;
  requirement?: string;
  source?: FitSource;
}): JobMatchData["items"][number] {
  return {
    __typename: "MatchItemType",
    requirement: partial.requirement ?? `${partial.verdict} requirement`,
    source: partial.source ?? FitSource.Resume,
    weight: "high",
    type: RequirementType.MustHave,
    verdict: partial.verdict,
    jdQuote: "JD quote",
    sourceQuotes: ["Resume quote"],
    suggestion: null,
  };
}

function completedMatch(
  items: JobMatchData["items"],
  id = "match-42",
): JobMatchData {
  return {
    __typename: "MatchAnalysisType",
    id,
    jobId: "job-1",
    resumeId: "resume-88",
    generationMetadata: {
      __typename: "AsyncMetadataType",
      status: AsyncMetadataStatus.Completed,
      error: null,
      timestamp: null,
    },
    scoreRatio: 76,
    classification: FitClassification.Positive,
    matchCount: 2,
    gapCount: 1,
    unclearCount: 0,
    items,
    createdAt: new Date().toISOString(),
  };
}

function setupApolloMocks(options: {
  jobMatch?: JobMatchData | undefined;
  loading?: boolean;
  error?: unknown;
  refetch?: ReturnType<typeof vi.fn>;
  deleteMutation?: ReturnType<typeof vi.fn>;
}) {
  const refetch =
    options.refetch ??
    vi
      .fn()
      .mockResolvedValue({
        data: options.jobMatch ? { jobMatch: options.jobMatch } : null,
      });

  gqlMocks.useJobMatchQuery.mockReturnValue({
    data: options.jobMatch ? { jobMatch: options.jobMatch } : undefined,
    loading: options.loading ?? false,
    error: options.error ?? undefined,
    refetch,
  });
  gqlMocks.useGenerateJobMatchMutation.mockReturnValue([
    vi.fn().mockResolvedValue({}),
    { loading: false },
  ]);
  gqlMocks.useDeleteMatchAnalysisMutation.mockReturnValue([
    options.deleteMutation ?? vi.fn().mockResolvedValue({}),
  ]);

  return { refetch };
}

function renderMatchTab(
  ui: ReactElement,
  options?: { withHeaderActions?: boolean },
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <JobActionsMenuItemsProvider>
        <PortalSlotsProvider>
          {options?.withHeaderActions ? (
            <DropdownMenu trigger={<Button>Actions</Button>}>
              <JobActionsMenuItemsOutlet />
            </DropdownMenu>
          ) : null}
          <JobHeaderActions.Slot />
          {children}
        </PortalSlotsProvider>
      </JobActionsMenuItemsProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("MatchTabContent", () => {
  beforeEach(() => {
    routerPushSpy.mockClear();
    sseMocks.useEventSource.mockClear();
    gqlMocks.useJobMatchQuery.mockReset();
    gqlMocks.useGenerateJobMatchMutation.mockReset();
    gqlMocks.useDeleteMatchAnalysisMutation.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders Generate match CTA when there is no jobMatch", async () => {
    const user = userEvent.setup();
    setupApolloMocks({ jobMatch: undefined });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    expect(screen.getByText(/no match analysis yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /generate match$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: "match-wizard-dialog" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("dialog", { name: "match-wizard-dialog" }),
    ).toHaveAttribute("data-has-existing-match", "false");
  });

  it("renders processing state when generation metadata is PROCESSING", () => {
    setupApolloMocks({
      jobMatch: {
        ...completedMatch([]),
        items: [],
        generationMetadata: {
          status: AsyncMetadataStatus.Processing,
          error: null,
        },
      },
    });
    renderMatchTab(<MatchTabContent jobId="job-1" />);
    expect(screen.getByText(/analyzing your match/i)).toBeInTheDocument();
  });

  it("renders failure state and Retry opens wizard", async () => {
    const user = userEvent.setup();
    const failedBase = completedMatch([]);
    setupApolloMocks({
      jobMatch: {
        ...failedBase,
        items: [],
        generationMetadata: {
          __typename: "AsyncMetadataType",
          status: AsyncMetadataStatus.Failed,
          error: "LLM unreachable",
          timestamp: null,
        },
      },
    });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    expect(screen.getByText(/llm unreachable/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry analysis/i }));

    expect(
      await screen.findByRole("dialog", { name: "match-wizard-dialog" }),
    ).toBeInTheDocument();
  });

  it("navigates to resume when Actions View resume is selected", async () => {
    const user = userEvent.setup();
    const items = [mockItem({ verdict: FitVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, {
      withHeaderActions: true,
    });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(screen.getByRole("menuitem", { name: /view resume/i }));

    expect(routerPushSpy).toHaveBeenCalledWith("/resumes/resume-88");
  });

  it("opens preferences dialog from Actions menu View preferences", async () => {
    const user = userEvent.setup();
    const items = [mockItem({ verdict: FitVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, {
      withHeaderActions: true,
    });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(
      screen.getByRole("menuitem", { name: /view preferences/i }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "preferences-dialog",
    });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAttribute("data-read-only", "true");
  });

  it("opens preferences dialog from match item card preference control", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({
        verdict: FitVerdict.Fit,
        source: FitSource.Preference,
        requirement: "Preference-backed skill",
      }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("button", { name: /work preferences/i }));

    expect(
      await screen.findByRole("dialog", { name: "preferences-dialog" }),
    ).toBeVisible();
  });

  it("shows match header menu items while tab content loads", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({ verdict: FitVerdict.Fit, requirement: "Skill A fit" }),
      mockItem({ verdict: FitVerdict.Gap, requirement: "Missing skill B gap" }),
    ];

    setupApolloMocks({ jobMatch: completedMatch(items), loading: true });
    renderMatchTab(<MatchTabContent jobId="job-1" />, {
      withHeaderActions: true,
    });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    expect(screen.getByText("Match")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /view resume/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /view preferences/i }),
    ).toBeInTheDocument();
  });

  it("renders completed match analysis content", async () => {
    const items = [
      mockItem({ verdict: FitVerdict.Fit, requirement: "Skill A fit" }),
      mockItem({ verdict: FitVerdict.Gap, requirement: "Missing skill B gap" }),
    ];

    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    screen.getByRole("button", { name: /^regenerate$/i });

    /** MatchClassification (detailed variant) renders rounded score % */
    expect(screen.getByText(/76%/i)).toBeInTheDocument();
    expect(screen.getByText(/skill A fit/i)).toBeVisible();
    expect(screen.getByText(/missing skill B gap/i)).toBeVisible();
  });

  it("defaults verdict filter to All (shows every item)", () => {
    const items = [
      mockItem({ verdict: FitVerdict.Fit, requirement: "only fit label" }),
      mockItem({ verdict: FitVerdict.Gap, requirement: "only gap label" }),
      mockItem({
        verdict: FitVerdict.Unclear,
        requirement: "only unclear label",
      }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    screen.getByText(/only fit label/i);
    screen.getByText(/only gap label/i);
    screen.getByText(/only unclear label/i);
  });

  it("shows only Fits when Fits tab selected", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({
        verdict: FitVerdict.Fit,
        requirement: "shown for fits filter",
      }),
      mockItem({
        verdict: FitVerdict.Gap,
        requirement: "hidden when fits focused",
      }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^fits$/i }));
    await waitFor(() => {
      expect(screen.getByText(/shown for fits filter/i)).toBeInTheDocument();
      expect(screen.queryByText(/hidden when fits focused/i)).toBeNull();
    });
  });

  it("shows only Gaps when Gaps tab selected", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({
        verdict: FitVerdict.Fit,
        requirement: "hidden when gaps focused",
      }),
      mockItem({
        verdict: FitVerdict.Gap,
        requirement: "shown for gaps filter",
      }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^gaps$/i }));
    await waitFor(() => {
      expect(screen.getByText(/shown for gaps filter/i)).toBeInTheDocument();
      expect(screen.queryByText(/hidden when gaps focused/i)).toBeNull();
    });
  });

  it("shows only Unclear when Unclear tab selected", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({
        verdict: FitVerdict.Fit,
        requirement: "hidden when unclear focused",
      }),
      mockItem({
        verdict: FitVerdict.Unclear,
        requirement: "shown for unclear filter",
      }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^unclear$/i }));
    await waitFor(() => {
      expect(screen.getByText(/shown for unclear filter/i)).toBeInTheDocument();
      expect(screen.queryByText(/hidden when unclear focused/i)).toBeNull();
    });
  });

  it("shows explicit empty-message when verdict filter hides every item", async () => {
    const user = userEvent.setup();
    const items = [
      mockItem({ verdict: FitVerdict.Fit }),
      mockItem({ verdict: FitVerdict.Fit }),
    ];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^gaps$/i }));
    expect(await screen.findByText(/no gaps found/i)).toBeInTheDocument();
  });

  it("Regenerate exposes wizard hasExistingMatch when match is rendered", async () => {
    const user = userEvent.setup();
    const items = [mockItem({ verdict: FitVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("button", { name: /^regenerate$/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("dialog", { name: "match-wizard-dialog" }),
      ).toHaveAttribute("data-has-existing-match", "true"),
    );
  });

  it("SSE: skips URL when query has no jobMatch id yet", () => {
    setupApolloMocks({ jobMatch: undefined });
    renderMatchTab(<MatchTabContent jobId="job-404" />);
    expect(sseMocks.useEventSource.mock.calls.some((c) => c[0] === null)).toBe(
      true,
    );
  });

  it("SSE: passes stream URL once jobMatch has id", () => {
    setupApolloMocks({ jobMatch: completedMatch([], "sse-match") });
    renderMatchTab(<MatchTabContent jobId="job-777" />);
    expect(
      sseMocks.useEventSource.mock.calls.some(
        (c) => c[0] === "https://api.test/matches/sse-match/stream",
      ),
    ).toBe(true);
  });

  it("SSE: invokes refetch after COMPLETED event", async () => {
    const { refetch } = setupApolloMocks({
      jobMatch: completedMatch(
        [mockItem({ verdict: FitVerdict.Fit })],
        "live-match",
      ),
    });
    renderMatchTab(<MatchTabContent jobId="job-live" />);
    await waitFor(() =>
      expect(sseMocks.useEventSource.mock.calls.length).toBeGreaterThanOrEqual(
        1,
      ),
    );
    const call = sseMocks.useEventSource.mock.calls.find(
      (c) => c[1] === "match_status_changed",
    );
    expect(call).toBeDefined();
    const onEvent = call![2] as (evt: { status: AsyncMetadataStatus }) => void;
    await onEvent({ status: AsyncMetadataStatus.Completed });

    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("SSE: invokes refetch after FAILED event", async () => {
    const { refetch } = setupApolloMocks({
      jobMatch: completedMatch([], "fail-match"),
    });
    renderMatchTab(<MatchTabContent jobId="job-fail-stream" />);
    await waitFor(() =>
      expect(sseMocks.useEventSource.mock.calls.length).toBeGreaterThanOrEqual(
        1,
      ),
    );
    const call = sseMocks.useEventSource.mock.calls.find(
      (c) => c[1] === "match_status_changed",
    )!;
    const onEvent = call[2] as (evt: { status: AsyncMetadataStatus }) => void;
    await onEvent({ status: AsyncMetadataStatus.Failed });

    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
