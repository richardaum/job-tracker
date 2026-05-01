import { describe, expect, it } from "vitest";

import { tipTapDocumentToPlainText } from "./tiptap.util";

describe("tipTapDocumentToPlainText", () => {
  it("joins TipTap paragraphs and nested text nodes", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Senior " },
            { type: "text", text: "Engineer" },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Remote friendly." }],
        },
      ],
    });
    expect(tipTapDocumentToPlainText(doc)).toBe(
      "Senior Engineer Remote friendly.",
    );
  });

  it("falls back for non-document JSON strings", () => {
    expect(tipTapDocumentToPlainText("  plain memo  ")).toBe("plain memo");
  });
});
