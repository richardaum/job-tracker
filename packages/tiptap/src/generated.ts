import { parseTipTapDocument } from "./parse";
import { plainTextToTipTap } from "./plain-text";
import type { TipTapDocument } from "./types";
import { asRecord } from "./utils";

export function normalizeGeneratedTipTapDocument(
  note: TipTapDocument,
  fallbackText: string,
): TipTapDocument {
  const noteRecord = asRecord(note);
  const contentRaw = Array.isArray(noteRecord?.content) ? noteRecord.content : [];
  const paragraphs: Array<{
    type: "paragraph";
    content: Array<{ type: "text"; text: string }>;
  }> = [];

  for (const block of contentRaw) {
    const blockRecord = asRecord(block);
    if (!blockRecord || blockRecord.type !== "paragraph") {
      continue;
    }
    const inlineRaw = Array.isArray(blockRecord.content) ? blockRecord.content : [];
    const textNodes: Array<{ type: "text"; text: string }> = [];

    for (const inline of inlineRaw) {
      const inlineRecord = asRecord(inline);
      if (!inlineRecord || inlineRecord.type !== "text") {
        continue;
      }
      const text = typeof inlineRecord.text === "string" ? inlineRecord.text.trim() : "";
      if (!text) {
        continue;
      }
      textNodes.push({ type: "text", text });
    }

    if (textNodes.length > 0) {
      paragraphs.push({ type: "paragraph", content: textNodes });
    }
  }

  if (paragraphs.length === 0) {
    const fallback = parseTipTapDocument(plainTextToTipTap(fallbackText));
    return (asRecord(fallback) ?? {
      type: "doc",
      content: [],
    }) as TipTapDocument;
  }

  return { type: "doc", content: paragraphs };
}
