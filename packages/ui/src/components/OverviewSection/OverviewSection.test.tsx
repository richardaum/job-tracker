import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverviewSection } from "./OverviewSection";

describe("OverviewSection", () => {
  it("renders children", () => {
    render(
      <OverviewSection>
        <span>Content</span>
      </OverviewSection>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders grid layout by default", () => {
    render(<OverviewSection className="custom-class">Grid</OverviewSection>);
    const el = screen.getByText("Grid");
    expect(el.className).toContain("flex-wrap");
    expect(el.className).toContain("custom-class");
  });

  it("renders stack layout when specified", () => {
    render(<OverviewSection layout="stack">Stack</OverviewSection>);
    const el = screen.getByText("Stack");
    expect(el.className).toContain("flex-col");
    expect(el.className).toContain("gap-3");
  });
});
