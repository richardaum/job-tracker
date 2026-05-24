import { Tabs, TabsList } from "@job-tracker/ui";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";
import { JobMatchStatusProvider } from "@/modules/jobs/details/hooks/JobMatchStatusProvider";
import {
  getMatchStatusChangedHandler,
  setupReactiveJobMatchQuery,
} from "@/modules/jobs/details/testing/match-sse-test-utils";
import {
  completedJobMatch,
  processingJobMatch,
} from "@/modules/jobs/details/testing/match-tab-test-fixtures";

import { MatchTabTrigger } from "./MatchTabTrigger";

const gqlMocks = vi.hoisted(() => ({ useJobMatchQuery: vi.fn() }));
const sseMocks = vi.hoisted(() => ({ useEventSource: vi.fn() }));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return { ...actual, useJobMatchQuery: gqlMocks.useJobMatchQuery };
});

vi.mock("@/hooks/useEventSource", () => ({
  useEventSource: sseMocks.useEventSource,
}));

vi.mock("@/lib/api-endpoints", () => ({
  getApiBaseUrl: () => "https://api.test",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    ref?: React.Ref<HTMLAnchorElement>;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderMatchTabTrigger() {
  return render(
    <JobMatchStatusProvider jobId="job-1">
      <Tabs value="match">
        <TabsList>
          <MatchTabTrigger tab="match" href="/jobs/job-1/match" />
        </TabsList>
      </Tabs>
    </JobMatchStatusProvider>,
  );
}

function getStatusDot() {
  return screen.getByTestId("match-status-badge", { hidden: true });
}

function getMatchTabTooltipTrigger() {
  return within(screen.getByRole("tab", { name: "Match" })).getByText("Match");
}

describe("MatchTabTrigger", () => {
  beforeEach(() => {
    gqlMocks.useJobMatchQuery.mockReset();
    sseMocks.useEventSource.mockReset();
  });

  it("shows active tab styles when the match tab is selected", () => {
    gqlMocks.useJobMatchQuery.mockReturnValue({
      data: { jobMatch: completedJobMatch([]) },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderMatchTabTrigger();

    expect(
      screen.getByRole("tab", { name: "Match", selected: true }),
    ).toHaveAttribute("data-state", "active");
  });

  it("shows status tooltip on hover when match has a status", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobMatchQuery.mockReturnValue({
      data: { jobMatch: completedJobMatch([]) },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderMatchTabTrigger();

    await user.hover(getMatchTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Match analysis is ready. Open to see fits, gaps, and unclear areas.",
    );
  });

  it("shows descriptive processing tooltip on hover", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobMatchQuery.mockReturnValue({
      data: { jobMatch: processingJobMatch() },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderMatchTabTrigger();

    await user.hover(getMatchTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Analyzing your resume against this job. Results will appear automatically.",
    );
  });

  it("includes error details in tooltip when match failed", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobMatchQuery.mockReturnValue({
      data: {
        jobMatch: {
          ...completedJobMatch([]),
          generationMetadata: {
            __typename: "AsyncMetadataType",
            status: AsyncMetadataStatus.Failed,
            error: "LLM unreachable",
            timestamp: null,
          },
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderMatchTabTrigger();

    await user.hover(getMatchTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Match analysis failed. Open the tab to retry. LLM unreachable",
    );
  });

  it("SSE COMPLETED: updates tab dot from processing pulse to completed", async () => {
    const user = userEvent.setup();
    setupReactiveJobMatchQuery(gqlMocks.useJobMatchQuery, {
      initial: processingJobMatch({ id: "tab-stream-match" }),
      afterRefetch: completedJobMatch([], { id: "tab-stream-match" }),
    });

    renderMatchTabTrigger();

    const processingDot = getStatusDot();
    expect(processingDot).toHaveClass("animate-match-status-pulse");
    expect(processingDot).toHaveClass("bg-text-warning");

    await waitFor(() =>
      expect(sseMocks.useEventSource.mock.calls.length).toBeGreaterThanOrEqual(
        1,
      ),
    );

    await act(async () => {
      await getMatchStatusChangedHandler(sseMocks.useEventSource)({
        status: AsyncMetadataStatus.Completed,
      });
    });

    await waitFor(() => {
      const dot = getStatusDot();
      expect(dot).toHaveClass("bg-text-success");
      expect(dot).not.toHaveClass("animate-match-status-pulse");
    });

    await user.hover(getMatchTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Match analysis is ready. Open to see fits, gaps, and unclear areas.",
    );
  });
});
