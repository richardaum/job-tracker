import { SlotsProvider } from "@job-tracker/react-slots";
import { Button, DropdownMenu } from "@job-tracker/ui";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

import { AsyncMetadataStatus, MatchSource, MatchVerdict } from "@/gql/hooks";
import { JobMatchStatusProvider } from "@/modules/jobs/details/hooks/JobMatchStatusProvider";
import { JobActionsMenuItems, JobDetailsSubTabs } from "@/modules/jobs/details/job-details-header.slots";
import { getMatchStatusChangedHandler } from "@/modules/jobs/details/testing/match-sub-test-utils";
import { setupReactiveMatchTabGraphqlMocks } from "@/modules/jobs/details/testing/match-sub-test-utils";
import {
  completedJobMatch,
  failedJobMatch,
  type JobMatchData,
  mockMatchItem,
  processingJobMatch,
} from "@/modules/jobs/details/testing/match-tab-test-fixtures";

import { MatchTabContent } from "./MatchTabContent";

vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({ useToastQueue: () => ({ enqueueToast: vi.fn() }) }));

const routerPushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushSpy }),
  useSearchParams: () => new URLSearchParams(),
}));

const gqlMocks = vi.hoisted(() => ({
  useJobMatchQuery: vi.fn(),
  useGenerateJobMatchMutation: vi.fn(),
  useDeleteMatchAnalysisMutation: vi.fn(),
  useJobMatchStatusChangedSubscription: vi.fn(),
}));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useJobMatchQuery: gqlMocks.useJobMatchQuery,
    useGenerateJobMatchMutation: gqlMocks.useGenerateJobMatchMutation,
    useDeleteMatchAnalysisMutation: gqlMocks.useDeleteMatchAnalysisMutation,
    useJobMatchStatusChangedSubscription: gqlMocks.useJobMatchStatusChangedSubscription,
  };
});

vi.mock("@/modules/work-preferences/components/PreferencesDialog", () => ({
  PreferencesDialog: ({ open, readOnly }: { open: boolean; readOnly?: boolean; onOpenChange?: (v: boolean) => void }) =>
    open ? <div role="dialog" aria-label="preferences-dialog" data-read-only={readOnly ? "true" : "false"} /> : null,
}));

vi.mock("@/modules/match-analyses/details/components/MatchWizardDialog", () => ({
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
        <button type="button" onClick={() => onOpenChange(false)} aria-label="Close wizard dialog">
          Close wizard
        </button>
        mock wizard panel
      </div>
    ) : null,
}));

function setupApolloMocks(options: {
  jobMatch?: JobMatchData | undefined;
  loading?: boolean;
  error?: unknown;
  refetch?: ReturnType<typeof vi.fn>;
  deleteMutation?: ReturnType<typeof vi.fn>;
}) {
  const refetch =
    options.refetch ?? vi.fn().mockResolvedValue({ data: options.jobMatch ? { jobMatch: options.jobMatch } : null });

  gqlMocks.useJobMatchQuery.mockReturnValue({
    data: options.jobMatch ? { jobMatch: options.jobMatch } : undefined,
    loading: options.loading ?? false,
    error: options.error ?? undefined,
    refetch,
  });
  gqlMocks.useGenerateJobMatchMutation.mockReturnValue([vi.fn().mockResolvedValue({}), { loading: false }]);
  gqlMocks.useDeleteMatchAnalysisMutation.mockReturnValue([options.deleteMutation ?? vi.fn().mockResolvedValue({})]);

  return { refetch };
}

function renderMatchTab(ui: ReactElement, options?: { withHeaderActions?: boolean; jobId?: string }) {
  const jobId = options?.jobId ?? "job-1";

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <JobMatchStatusProvider jobId={jobId}>
        <SlotsProvider>
          {options?.withHeaderActions ? (
            <DropdownMenu trigger={<Button>Actions</Button>}>
              <JobActionsMenuItems.Slot />
            </DropdownMenu>
          ) : null}
          <JobDetailsSubTabs.Slot />
          {children}
        </SlotsProvider>
      </JobMatchStatusProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("MatchTabContent", () => {
  beforeEach(() => {
    routerPushSpy.mockClear();
    gqlMocks.useJobMatchQuery.mockReset();
    gqlMocks.useGenerateJobMatchMutation.mockReset();
    gqlMocks.useDeleteMatchAnalysisMutation.mockReset();
    gqlMocks.useJobMatchStatusChangedSubscription.mockReturnValue(undefined);
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
      expect(screen.getByRole("dialog", { name: "match-wizard-dialog" })).toBeInTheDocument();
    });
    expect(screen.getByRole("dialog", { name: "match-wizard-dialog" })).toHaveAttribute(
      "data-has-existing-match",
      "false",
    );
  });

  it("renders processing state when generation metadata is PROCESSING", () => {
    setupApolloMocks({
      jobMatch: {
        ...completedJobMatch([]),
        items: [],
        generationMetadata: { status: AsyncMetadataStatus.Processing, error: null },
      },
    });
    renderMatchTab(<MatchTabContent jobId="job-1" />);
    expect(screen.getByText(/analyzing your match/i)).toBeInTheDocument();
  });

  it("renders failure state and Retry opens wizard", async () => {
    const user = userEvent.setup();
    const failedBase = completedJobMatch([]);
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

    expect(await screen.findByRole("dialog", { name: "match-wizard-dialog" })).toBeInTheDocument();
  });

  it("navigates to resume when Actions View resume is selected", async () => {
    const user = userEvent.setup();
    const items = [mockMatchItem({ verdict: MatchVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(screen.getByRole("menuitem", { name: /view resume/i }));

    expect(routerPushSpy).toHaveBeenCalledWith("/profile/resumes/resume-88");
  });

  it("does not show View resume when match has no resumeId", async () => {
    const user = userEvent.setup();
    const items = [mockMatchItem({ verdict: MatchVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedJobMatch(items, { resumeId: null }) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));

    expect(screen.getByRole("menuitem", { name: /view preferences/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /view resume/i })).not.toBeInTheDocument();
  });

  it("renders error message when jobMatch query fails", () => {
    setupApolloMocks({ error: new Error("network"), jobMatch: undefined });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    expect(screen.getByText(/failed to load match analysis/i)).toBeInTheDocument();
  });

  it("does not render a Generate or Regenerate button outside Match content", () => {
    setupApolloMocks({ loading: true, jobMatch: undefined });
    const { rerender } = renderMatchTab(<MatchTabContent jobId="job-1" />);

    expect(screen.queryByRole("button", { name: /^(generate|regenerate)$/i })).not.toBeInTheDocument();

    const items = [mockMatchItem({ verdict: MatchVerdict.Fit })];
    setupApolloMocks({ loading: false, jobMatch: completedJobMatch(items) });
    rerender(<MatchTabContent jobId="job-1" />);

    expect(screen.queryByRole("button", { name: /^(generate|regenerate)$/i })).not.toBeInTheDocument();
  });

  it("opens the match wizard from the Actions menu", async () => {
    const user = userEvent.setup();
    setupApolloMocks({ jobMatch: undefined });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(screen.getByRole("menuitem", { name: /^generate match$/i }));

    expect(await screen.findByRole("dialog", { name: "match-wizard-dialog" })).toHaveAttribute(
      "data-has-existing-match",
      "false",
    );
  });

  it("opens preferences dialog from Actions menu View preferences", async () => {
    const user = userEvent.setup();
    const items = [mockMatchItem({ verdict: MatchVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(screen.getByRole("menuitem", { name: /view preferences/i }));

    const dialog = await screen.findByRole("dialog", { name: "preferences-dialog" });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveAttribute("data-read-only", "true");
  });

  it("opens preferences dialog from match item card preference control", async () => {
    const user = userEvent.setup();
    const items = [
      mockMatchItem({
        verdict: MatchVerdict.Fit,
        source: MatchSource.Preference,
        requirement: "Preference-backed skill",
      }),
    ];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("button", { name: /work preferences/i }));

    expect(await screen.findByRole("dialog", { name: "preferences-dialog" })).toBeVisible();
  });

  it("shows match header menu items while tab content loads", async () => {
    const user = userEvent.setup();
    const items = [
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "Skill A fit" }),
      mockMatchItem({ verdict: MatchVerdict.Gap, requirement: "Missing skill B gap" }),
    ];

    setupApolloMocks({ jobMatch: completedJobMatch(items), loading: true });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    expect(screen.getByText("Match")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /view resume/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /view preferences/i })).toBeInTheDocument();
  });

  it("renders completed match analysis content", async () => {
    const items = [
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "Skill A fit" }),
      mockMatchItem({ verdict: MatchVerdict.Gap, requirement: "Missing skill B gap" }),
    ];

    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    /** MatchClassification (detailed variant) renders rounded score % */
    expect(screen.getByText(/76%/i)).toBeInTheDocument();
    expect(screen.getByText(/skill A fit/i)).toBeVisible();
    expect(screen.getByText(/missing skill B gap/i)).toBeVisible();
  });

  it("defaults verdict filter to All (shows every item)", () => {
    const items = [
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "only fit label" }),
      mockMatchItem({ verdict: MatchVerdict.Gap, requirement: "only gap label" }),
      mockMatchItem({ verdict: MatchVerdict.Unclear, requirement: "only unclear label" }),
    ];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    screen.getByText(/only fit label/i);
    screen.getByText(/only gap label/i);
    screen.getByText(/only unclear label/i);
  });

  it("shows only Fits when Fits tab selected", async () => {
    const user = userEvent.setup();
    const items = [
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "shown for fits filter" }),
      mockMatchItem({ verdict: MatchVerdict.Gap, requirement: "hidden when fits focused" }),
    ];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
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
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "hidden when gaps focused" }),
      mockMatchItem({ verdict: MatchVerdict.Gap, requirement: "shown for gaps filter" }),
    ];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
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
      mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "hidden when unclear focused" }),
      mockMatchItem({ verdict: MatchVerdict.Unclear, requirement: "shown for unclear filter" }),
    ];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^unclear$/i }));
    await waitFor(() => {
      expect(screen.getByText(/shown for unclear filter/i)).toBeInTheDocument();
      expect(screen.queryByText(/hidden when unclear focused/i)).toBeNull();
    });
  });

  it("shows explicit empty-message when verdict filter hides every item", async () => {
    const user = userEvent.setup();
    const items = [mockMatchItem({ verdict: MatchVerdict.Fit }), mockMatchItem({ verdict: MatchVerdict.Fit })];
    setupApolloMocks({ jobMatch: completedJobMatch(items) });
    renderMatchTab(<MatchTabContent jobId="job-1" />);

    await user.click(screen.getByRole("tab", { name: /^gaps$/i }));
    expect(await screen.findByText(/no gaps found/i)).toBeInTheDocument();
  });

  it("opens the match wizard as a regeneration from the Actions menu", async () => {
    const user = userEvent.setup();
    setupApolloMocks({ jobMatch: completedJobMatch([mockMatchItem({ verdict: MatchVerdict.Fit })]) });
    renderMatchTab(<MatchTabContent jobId="job-1" />, { withHeaderActions: true });

    await user.click(screen.getByRole("button", { name: /^actions$/i }));
    await user.click(screen.getByRole("menuitem", { name: /^regenerate match$/i }));

    expect(await screen.findByRole("dialog", { name: "match-wizard-dialog" })).toHaveAttribute(
      "data-has-existing-match",
      "true",
    );
  });

  it("subscription: invokes refetch after COMPLETED event", async () => {
    const { refetch } = setupApolloMocks({
      jobMatch: completedJobMatch([mockMatchItem({ verdict: MatchVerdict.Fit })], { id: "live-match" }),
    });
    renderMatchTab(<MatchTabContent jobId="job-live" />);
    await waitFor(() =>
      expect(gqlMocks.useJobMatchStatusChangedSubscription.mock.calls.length).toBeGreaterThanOrEqual(1),
    );
    const onEvent = getMatchStatusChangedHandler(gqlMocks.useJobMatchStatusChangedSubscription);
    await onEvent({ status: AsyncMetadataStatus.Completed });

    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("subscription: invokes refetch after FAILED event", async () => {
    const { refetch } = setupApolloMocks({ jobMatch: completedJobMatch([], { id: "fail-match" }) });
    renderMatchTab(<MatchTabContent jobId="job-fail-stream" />);
    await waitFor(() =>
      expect(gqlMocks.useJobMatchStatusChangedSubscription.mock.calls.length).toBeGreaterThanOrEqual(1),
    );
    const onEvent = getMatchStatusChangedHandler(gqlMocks.useJobMatchStatusChangedSubscription);
    await onEvent({ status: AsyncMetadataStatus.Failed });

    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("subscription COMPLETED: updates tab body from processing to completed content", async () => {
    const fitItem = mockMatchItem({ verdict: MatchVerdict.Fit, requirement: "React streams into view" });
    setupReactiveMatchTabGraphqlMocks(gqlMocks.useJobMatchQuery, {
      initial: processingJobMatch({ id: "stream-match" }),
      afterRefetch: completedJobMatch([fitItem], { id: "stream-match" }),
      useGenerateJobMatchMutationMock: gqlMocks.useGenerateJobMatchMutation,
      useDeleteMatchAnalysisMutationMock: gqlMocks.useDeleteMatchAnalysisMutation,
    });

    renderMatchTab(<MatchTabContent jobId="job-stream-ui" />);

    expect(screen.getByText(/analyzing your match/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(gqlMocks.useJobMatchStatusChangedSubscription.mock.calls.length).toBeGreaterThanOrEqual(1),
    );

    await act(async () => {
      await getMatchStatusChangedHandler(gqlMocks.useJobMatchStatusChangedSubscription)({
        status: AsyncMetadataStatus.Completed,
      });
    });

    expect(await screen.findByText(/react streams into view/i)).toBeInTheDocument();
    expect(screen.getByText(/76%/i)).toBeInTheDocument();
    expect(screen.queryByText(/analyzing your match/i)).not.toBeInTheDocument();
  });

  it("subscription FAILED: updates tab body from processing to failed state", async () => {
    setupReactiveMatchTabGraphqlMocks(gqlMocks.useJobMatchQuery, {
      initial: processingJobMatch({ id: "stream-fail-match" }),
      afterRefetch: failedJobMatch("LLM unreachable", { id: "stream-fail-match" }),
      useGenerateJobMatchMutationMock: gqlMocks.useGenerateJobMatchMutation,
      useDeleteMatchAnalysisMutationMock: gqlMocks.useDeleteMatchAnalysisMutation,
    });

    renderMatchTab(<MatchTabContent jobId="job-stream-fail-ui" />);

    expect(screen.getByText(/analyzing your match/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(gqlMocks.useJobMatchStatusChangedSubscription.mock.calls.length).toBeGreaterThanOrEqual(1),
    );

    await act(async () => {
      await getMatchStatusChangedHandler(gqlMocks.useJobMatchStatusChangedSubscription)({
        status: AsyncMetadataStatus.Failed,
      });
    });

    expect(await screen.findByText(/analysis failed/i)).toBeInTheDocument();
    expect(screen.getByText(/llm unreachable/i)).toBeInTheDocument();
    expect(screen.queryByText(/analyzing your match/i)).not.toBeInTheDocument();
  });
});
