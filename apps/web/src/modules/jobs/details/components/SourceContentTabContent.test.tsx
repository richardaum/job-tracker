import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceContentTabContent } from "./SourceContentTabContent";

describe("SourceContentTabContent", () => {
  it("renders iframe with sandbox, no-referrer, and CSP-wrapped srcDoc", () => {
    const html = `<p id="inside">Captured</p>`;
    render(<SourceContentTabContent htmlContent={html} />);

    const frame = screen.getByTitle("Source posting HTML") as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute("sandbox");
    expect(frame).toHaveAttribute("referrerPolicy", "no-referrer");

    const srcDoc = frame.getAttribute("srcDoc") ?? "";
    expect(srcDoc).toContain(html);
    expect(srcDoc).toContain("Content-Security-Policy");
    expect(srcDoc).toContain("script-src 'none'");
  });

  it("strips executable markup before rendering srcDoc", () => {
    const html = `<p>Captured</p><script>alert(1)</script>`;
    render(<SourceContentTabContent htmlContent={html} />);

    const srcDoc = screen.getByTitle("Source posting HTML").getAttribute("srcDoc") ?? "";
    expect(srcDoc).toContain("Captured");
    expect(srcDoc).not.toContain("<script");
  });
});
