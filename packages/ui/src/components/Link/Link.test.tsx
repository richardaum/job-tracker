import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link } from "./Link";

describe("Link", () => {
  it("renders an anchor with href", () => {
    render(<Link href="/applications">Applications</Link>);
    expect(screen.getByRole("link", { name: /applications/i })).toHaveAttribute(
      "href",
      "/applications",
    );
  });

  it("supports muted variant", () => {
    render(
      <Link href="/settings" variant="muted">
        Settings
      </Link>,
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveClass(
      "text-text-secondary",
    );
  });
});
