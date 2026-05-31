import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuickFilters } from "./QuickFilters";

const navigationMocks = { searchParams: "" };
const routerPushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/jobs",
  useRouter: () => ({ push: routerPushSpy, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
}));

function queryFromRouterPush(callIndex = 0) {
  const target = routerPushSpy.mock.calls[callIndex]?.[0] as string | undefined;
  expect(target).toBeDefined();
  const [pathnameWithMaybeQuery] = (typeof target === "string" ? target : "").split("#");
  const queryStart = pathnameWithMaybeQuery.indexOf("?");
  if (queryStart === -1) return new URLSearchParams();
  return new URLSearchParams(pathnameWithMaybeQuery.slice(queryStart + 1));
}

describe("QuickFilters", () => {
  beforeEach(() => {
    navigationMocks.searchParams = "";
    routerPushSpy.mockClear();
  });

  it("toggle off All uses explicit q=incoming (preserves other params)", async () => {
    navigationMocks.searchParams = "q=all&company=Acme";
    const user = userEvent.setup();

    render(<QuickFilters />);
    await user.click(screen.getByRole("button", { name: "All" }));

    expect(routerPushSpy).toHaveBeenCalledTimes(1);
    const qs = queryFromRouterPush(0);
    expect(qs.get("q")).toBe("incoming");
    expect(qs.get("company")).toBe("Acme");
  });

  it("toggle off Draft removes q without forcing bare ? when no other params", async () => {
    navigationMocks.searchParams = "q=draft";
    const user = userEvent.setup();

    render(<QuickFilters />);
    await user.click(screen.getByRole("button", { name: "Draft" }));

    expect(routerPushSpy).toHaveBeenCalledWith("/jobs");
  });
});
