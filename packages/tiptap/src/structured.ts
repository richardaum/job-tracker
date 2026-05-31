import { parseTipTapDocument } from "./parse";
import { plainTextToTipTap } from "./plain-text";
import type { StructuredNoteOutput, TipTapDocument, TipTapNode } from "./types";

export function structuredNoteToTipTapDocument(
  structured: StructuredNoteOutput,
  fallbackText: string,
): TipTapDocument {
  const content: TipTapNode[] = [];

  for (const section of structured.sections) {
    const heading = section.heading.trim();
    const bullets = section.bullets.map((b) => b.trim()).filter(Boolean);

    if (heading) {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: heading }],
      });
    }

    if (bullets.length > 0) {
      content.push({
        type: "bulletList",
        content: bullets.map((bullet) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: bullet }] }],
        })),
      });
    }
  }

  if (content.length === 0) {
    return parseTipTapDocument(plainTextToTipTap(fallbackText));
  }

  return { type: "doc", content };
}
