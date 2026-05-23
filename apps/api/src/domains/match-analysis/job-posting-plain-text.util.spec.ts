import { describe, expect, it } from "vitest";

import { resolveJobPostingPlainText } from "./job-posting-plain-text.util";

describe("resolveJobPostingPlainText", () => {
  const tiptap = (text: string) =>
    JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });

  it("prefers htmlContent converted to plain text when both sources exist", () => {
    const plain = resolveJobPostingPlainText({
      htmlContent: "<p>Hello <b>JD</b></p>",
      description: tiptap("IGNORE DESC"),
    });
    expect(plain).toContain("JD");
    expect(plain).not.toContain("IGNORE");
  });

  it("uses TipTap description when htmlContent is absent", () => {
    expect(
      resolveJobPostingPlainText({
        description: tiptap("Only TipTap"),
        htmlContent: "",
      }),
    ).toContain("Only TipTap");
  });

  it("falls back to description when html parses to whitespace only", () => {
    expect(
      resolveJobPostingPlainText({
        htmlContent: "<br/>",
        description: tiptap("Fallback text"),
      }),
    ).toContain("Fallback");
  });

  it("returns empty string when neither source yields text", () => {
    expect(
      resolveJobPostingPlainText({ htmlContent: "", description: "" }),
    ).toBe("");
  });
});
