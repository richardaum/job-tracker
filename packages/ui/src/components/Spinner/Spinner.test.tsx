import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders as status element", () => {
    render(<Spinner label="Loading jobs" />);
    expect(
      screen.getByRole("status", { name: /loading jobs/i }),
    ).toBeInTheDocument();
  });

  it("supports size variants", () => {
    render(<Spinner size="lg" label="Syncing" />);
    expect(screen.getByRole("status", { name: /syncing/i })).toHaveClass(
      "size-7",
    );
  });
});
