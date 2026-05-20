import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { Link } from "./Link";

describe("Link", () => {
  it("renders an anchor with href", () => {
    render(<Link href="/jobs">Jobs</Link>);
    expect(screen.getByRole("link", { name: /jobs/i })).toHaveAttribute(
      "href",
      "/jobs",
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
