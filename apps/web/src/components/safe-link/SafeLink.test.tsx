import type { Route } from "next";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({ searchParams: "" }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(navigationMocks.searchParams) }));

import { SafeLink } from "./SafeLink";

describe("SafeLink", () => {
  beforeEach(() => {
    navigationMocks.searchParams = "";
  });

  it("merges all query params by default", () => {
    navigationMocks.searchParams = "w=full&cid=conv-1&q=draft";

    render(<SafeLink href={"/jobs/job-1/match" as Route}>Match</SafeLink>);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/jobs/job-1/match?w=full&cid=conv-1&q=draft");
  });

  it("merges only whitelisted query params", () => {
    navigationMocks.searchParams = "w=full&cid=conv-1&q=draft";

    render(
      <SafeLink href={"/jobs/job-1/match" as Route} preserveQueryParams={["w"]}>
        Match
      </SafeLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/jobs/job-1/match?w=full");
  });

  it("does not override params already present in href", () => {
    navigationMocks.searchParams = "w=full&cid=conv-1";

    render(
      <SafeLink href={"/jobs/job-1/chat?w=side" as Route} preserveQueryParams={["w", "cid"]}>
        Chat
      </SafeLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/jobs/job-1/chat?w=side&cid=conv-1");
  });

  it("skips merge when preserveQueryParams is false", () => {
    navigationMocks.searchParams = "w=full";

    render(
      <SafeLink href={"/jobs/job-1" as Route} preserveQueryParams={false}>
        Job
      </SafeLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/jobs/job-1");
  });
});
