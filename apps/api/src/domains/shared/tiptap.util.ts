export function isTipTapDocumentString(input: string): boolean {
  try {
    const parsed = JSON.parse(input) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

export function plainTextToTipTap(input: string): string {
  const paragraphs = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    }));

  return JSON.stringify({
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  });
}

export function parseTipTapDocument(input: string): TipTapDocument {
  const normalized = normalizeTipTapDocument(input);
  return JSON.parse(normalized);
}

export function normalizeTipTapDocument(input: string): string {
  return input.trim();
}

export type TipTapDocument = Record<string, unknown>;

export type StructuredNoteSection = { heading: string; bullets: string[] };

export type StructuredNoteOutput = { sections: StructuredNoteSection[] };

export function normalizeGeneratedTipTapDocument(
  note: TipTapDocument,
  fallbackText: string,
): TipTapDocument {
  const noteRecord = asRecord(note);
  const contentRaw = Array.isArray(noteRecord?.content)
    ? noteRecord.content
    : [];
  const paragraphs: Array<{
    type: "paragraph";
    content: Array<{ type: "text"; text: string }>;
  }> = [];

  for (const block of contentRaw) {
    const blockRecord = asRecord(block);
    if (!blockRecord || blockRecord.type !== "paragraph") {
      continue;
    }
    const inlineRaw = Array.isArray(blockRecord.content)
      ? blockRecord.content
      : [];
    const textNodes: Array<{ type: "text"; text: string }> = [];

    for (const inline of inlineRaw) {
      const inlineRecord = asRecord(inline);
      if (!inlineRecord || inlineRecord.type !== "text") {
        continue;
      }
      const text =
        typeof inlineRecord.text === "string" ? inlineRecord.text.trim() : "";
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
    return asRecord(fallback) ?? { type: "doc", content: [] };
  }

  return { type: "doc", content: paragraphs };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function structuredNoteToTipTapDocument(
  structured: StructuredNoteOutput,
  fallbackText: string,
): TipTapDocument {
  const content: Array<Record<string, unknown>> = [];

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
          content: [
            { type: "paragraph", content: [{ type: "text", text: bullet }] },
          ],
        })),
      });
    }
  }

  if (content.length === 0) {
    return parseTipTapDocument(plainTextToTipTap(fallbackText));
  }

  return { type: "doc", content };
}
