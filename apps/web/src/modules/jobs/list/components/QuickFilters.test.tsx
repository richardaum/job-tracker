import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuickFilters } from "./QuickFilters";

const navigationMocks = { searchParams: "" };
const routerPushSpy = vi.fn();

const useQuickFilterCountsQueryMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/jobs",
  useRouter: () => ({ push: routerPushSpy, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
}));

vi.mock("@/gql/hooks", () => ({
  ApplicationQuickFilter: {
    Active: "Active",
    Applied: "Applied",
    Draft: "Draft",
    Duplicated: "Duplicated",
    Incoming: "Incoming",
    New: "New",
    Rejected: "Rejected",
  },
  useQuickFilterCountsQuery: (...args: unknown[]) => useQuickFilterCountsQueryMock(...args),
}));

function queryFromRouterPush(callIndex = 0) {
  const target = routerPushSpy.mock.calls[callIndex]?.[0] as string | undefined;
  expect(target).toBeDefined();
  const [pathnameWithMaybeQuery] = (typeof target === "string" ? target : "").split("#");
  const queryStart = pathnameWithMaybeQuery.indexOf("?");
  if (queryStart === -1) return new URLSearchParams();
  return new URLSearchParams(pathnameWithMaybeQuery.slice(queryStart + 1));
}

function defaultQuickFilterCounts() {
  return {
    data: {
      quickFilterCounts: [
        { __typename: "FilterCountType", key: "Draft", count: 3 },
        { __typename: "FilterCountType", key: "Incoming", count: 5 },
        { __typename: "FilterCountType", key: "Active", count: 2 },
        { __typename: "FilterCountType", key: "Applied", count: 1 },
        { __typename: "FilterCountType", key: "New", count: 7 },
        { __typename: "FilterCountType", key: "Duplicated", count: 0 },
        { __typename: "FilterCountType", key: "Rejected", count: 4 },
      ],
    },
    loading: false,
  };
}

describe("QuickFilters", () => {
  beforeEach(() => {
    navigationMocks.searchParams = "";
    routerPushSpy.mockClear();
    useQuickFilterCountsQueryMock.mockReturnValue(defaultQuickFilterCounts());
  });

  it("renders count badge when count > 0", () => {
    render(<QuickFilters />);

    expect(screen.getByRole("button", { name: /^New/ })).toHaveTextContent("New(7)");
    expect(screen.getByRole("button", { name: /^Draft/ })).toHaveTextContent("Draft(3)");
    expect(screen.getByRole("button", { name: /^Incoming/ })).toHaveTextContent("Incoming(5)");
  });

  it("renders label without badge when count is 0", () => {
    useQuickFilterCountsQueryMock.mockReturnValue({
      data: {
        quickFilterCounts: [
          { __typename: "FilterCountType", key: "Duplicated", count: 0 },
          { __typename: "FilterCountType", key: "Draft", count: 0 },
          { __typename: "FilterCountType", key: "Incoming", count: 0 },
          { __typename: "FilterCountType", key: "Active", count: 0 },
          { __typename: "FilterCountType", key: "Applied", count: 0 },
          { __typename: "FilterCountType", key: "New", count: 0 },
          { __typename: "FilterCountType", key: "Rejected", count: 0 },
        ],
      },
      loading: false,
    });

    render(<QuickFilters />);

    expect(screen.getByRole("button", { name: /^New/ })).toHaveTextContent("New");
    expect(screen.getByRole("button", { name: /^Duplicated/ })).toHaveTextContent("Duplicated");
    expect(screen.queryByText("(0)")).not.toBeInTheDocument();
  });

  it("All chip shows total sum of all counts", () => {
    render(<QuickFilters />);

    expect(screen.getByRole("button", { name: /^All/ })).toHaveTextContent("All(22)");
  });

  it("chip click still toggles the q= filter parameter", async () => {
    const user = userEvent.setup();

    render(<QuickFilters />);
    await user.click(screen.getByRole("button", { name: /^Draft/ }));

    expect(routerPushSpy).toHaveBeenCalledTimes(1);
    const qs = queryFromRouterPush(0);
    expect(qs.get("q")).toBe("draft");
  });

  it("active chip styling unchanged", () => {
    navigationMocks.searchParams = "q=draft";

    render(<QuickFilters />);

    const draftChip = screen.getByRole("button", { name: /^Draft/ });
    expect(draftChip.getAttribute("class")).toContain("border-brand");
  });

  it("marks the Active chip as the final welcome-tour filter target", () => {
    render(<QuickFilters />);

    expect(screen.getByRole("button", { name: /^Active/ })).toHaveAttribute(
      "data-welcome-tour-step",
      "active-jobs-filter",
    );
  });

  it("restricts keyboard interaction to the requested filter", () => {
    render(<QuickFilters restrictInteractionTo="active" />);

    const activeFilter = screen.getByRole("button", { name: /^Active/ });
    const draftFilter = screen.getByRole("button", { name: /^Draft/ });

    expect(activeFilter).not.toHaveAttribute("tabindex", "-1");
    expect(draftFilter).toHaveAttribute("tabindex", "-1");
  });

  it("toggle off All uses explicit q=incoming (preserves other params)", async () => {
    navigationMocks.searchParams = "q=all&company=Acme";
    const user = userEvent.setup();

    render(<QuickFilters />);
    await user.click(screen.getByRole("button", { name: /^All/ }));

    expect(routerPushSpy).toHaveBeenCalledTimes(1);
    const qs = queryFromRouterPush(0);
    expect(qs.get("q")).toBe("incoming");
    expect(qs.get("company")).toBe("Acme");
  });

  it("toggle off Draft removes q without forcing bare ? when no other params", async () => {
    navigationMocks.searchParams = "q=draft";
    const user = userEvent.setup();

    render(<QuickFilters />);
    await user.click(screen.getByRole("button", { name: /^Draft/ }));

    expect(routerPushSpy).toHaveBeenCalledWith("/jobs");
  });
});
