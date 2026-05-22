import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceContentTabContent } from "./SourceContentTabContent";

describe("SourceContentTabContent", () => {
  it("renders iframe with sandbox and srcDoc from htmlContent", () => {
    const html = `<p id="inside">Captured</p>`;
    render(<SourceContentTabContent htmlContent={html} />);

    const frame = screen.getByTitle("Source posting HTML") as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("sandbox");
    expect(frame.getAttribute("srcDoc")).toBe(html);
  });
});
