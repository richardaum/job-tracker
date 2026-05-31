import { Tabs, TabsList } from "@job-tracker/ui";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Route } from "next";
import { useCallback, useState } from "react";
import type { ReactNode, Ref } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AsyncMetadataStatus } from "@/gql/hooks";
import { JobFillStatusProvider } from "@/modules/jobs/details/hooks/JobFillStatusProvider";

import { OverviewTabTrigger } from "./OverviewTabTrigger";

const gqlMocks = vi.hoisted(() => ({
  useJobQuery: vi.fn(),
  useJobFillStatusChangedSubscription: vi.fn(),
}));

vi.mock("@/gql/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/gql/hooks")>();
  return {
    ...actual,
    useJobQuery: gqlMocks.useJobQuery,
    useJobFillStatusChangedSubscription:
      gqlMocks.useJobFillStatusChangedSubscription,
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    ref?: Ref<HTMLAnchorElement>;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function processingFillJob() {
  return {
    id: "job-1",
    fillMetadata: {
      __typename: "AsyncMetadataType" as const,
      status: AsyncMetadataStatus.Processing,
      error: null,
      timestamp: null,
    },
  };
}

function completedFillJob() {
  return {
    id: "job-1",
    fillMetadata: {
      __typename: "AsyncMetadataType" as const,
      status: AsyncMetadataStatus.Completed,
      error: null,
      timestamp: "2026-05-25T12:00:00.000Z",
    },
  };
}

function renderOverviewTabTrigger() {
  return render(
    <JobFillStatusProvider jobId="job-1">
      <Tabs value="overview">
        <TabsList>
          <OverviewTabTrigger tab="overview" href={"/jobs/job-1" as Route} />
        </TabsList>
      </Tabs>
    </JobFillStatusProvider>,
  );
}

function getStatusDot() {
  return document.querySelector(
    '[data-testid="match-status-badge"]',
  ) as HTMLElement;
}

function getOverviewTabTooltipTrigger() {
  return within(screen.getByRole("tab", { name: "Overview" })).getByText(
    "Overview",
  );
}

function getFillStatusChangedHandler() {
  const call = gqlMocks.useJobFillStatusChangedSubscription.mock.calls.find(
    (entry) => entry[0]?.onData !== undefined,
  );
  if (!call) {
    throw new Error(
      "jobFillStatusChanged subscription onData handler not found",
    );
  }

  return call[0].onData as (evt: {
    data: { data: { jobFillStatusChanged: { status: string } } };
  }) => void;
}

describe("OverviewTabTrigger", () => {
  beforeEach(() => {
    gqlMocks.useJobQuery.mockReset();
    gqlMocks.useJobFillStatusChangedSubscription.mockReset();
  });

  it("shows active tab styles when the overview tab is selected", () => {
    gqlMocks.useJobQuery.mockReturnValue({
      data: { job: completedFillJob() },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderOverviewTabTrigger();

    expect(
      screen.getByRole("tab", { name: "Overview", selected: true }),
    ).toHaveAttribute("data-state", "active");
  });

  it("shows status tooltip on hover when fill has a status", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobQuery.mockReturnValue({
      data: { job: completedFillJob() },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderOverviewTabTrigger();

    await user.hover(getOverviewTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Job fields were filled automatically. Open Overview to review.",
    );
  });

  it("shows descriptive processing tooltip on hover", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobQuery.mockReturnValue({
      data: { job: processingFillJob() },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderOverviewTabTrigger();

    await user.hover(getOverviewTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Filling job fields automatically. Updates will appear when complete.",
    );
  });

  it("updates tab dot from processing pulse to completed on subscription event", async () => {
    const user = userEvent.setup();
    gqlMocks.useJobQuery.mockImplementation(() => {
      const [job, setJob] = useState<
        | ReturnType<typeof processingFillJob>
        | ReturnType<typeof completedFillJob>
      >(processingFillJob());

      const refetch = useCallback(async () => {
        setJob(completedFillJob());
        return { data: { job: completedFillJob() } };
      }, []);

      return { data: { job }, loading: false, error: undefined, refetch };
    });

    renderOverviewTabTrigger();

    const processingDot = getStatusDot();
    expect(processingDot).toHaveClass("animate-match-status-pulse");
    expect(processingDot).toHaveClass("bg-text-warning");

    await waitFor(() =>
      expect(
        gqlMocks.useJobFillStatusChangedSubscription.mock.calls.length,
      ).toBeGreaterThanOrEqual(1),
    );

    await act(async () => {
      await getFillStatusChangedHandler()({
        data: {
          data: {
            jobFillStatusChanged: { status: AsyncMetadataStatus.Completed },
          },
        },
      });
    });

    await waitFor(() => {
      const dot = getStatusDot();
      expect(dot).toHaveClass("bg-text-success");
      expect(dot).not.toHaveClass("animate-match-status-pulse");
    });

    await user.hover(getOverviewTabTooltipTrigger());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Job fields were filled automatically. Open Overview to review.",
    );
  });
});
