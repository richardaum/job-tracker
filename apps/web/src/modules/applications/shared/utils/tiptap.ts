export const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
};

function collectText(node: TipTapNode): string {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content.map(collectText).join("");
}

export function isTipTapDocumentString(input: string): boolean {
  try {
    const parsed = JSON.parse(input) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

export function normalizeTipTapDocument(
  input: string | null | undefined,
): string {
  if (!input) return EMPTY_TIPTAP_DOC;
  if (isTipTapDocumentString(input)) return input;
  const text = input.trim();
  if (!text) return EMPTY_TIPTAP_DOC;
  return plainTextToTipTap(text);
}

export function tipTapToPlainText(input: string | null | undefined): string {
  if (!input) return "";
  if (!isTipTapDocumentString(input)) return input;

  try {
    const parsed = JSON.parse(input) as TipTapNode;
    if (!Array.isArray(parsed.content)) return "";

    return parsed.content
      .map((block) => collectText(block))
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  } catch {
    return "";
  }
}

export function plainTextToTipTap(input: string): string {
  const paragraphs = input
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => ({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    }));

  if (paragraphs.length === 0) {
    return EMPTY_TIPTAP_DOC;
  }

  return JSON.stringify({ type: "doc", content: paragraphs });
}

type TipTapDocument = {
  type: "doc";
  content: TipTapNode[];
};

function isTipTapDocument(value: unknown): value is TipTapDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { type?: unknown; content?: unknown };
  return candidate.type === "doc" && Array.isArray(candidate.content);
}

export function parseTipTapDocument(
  input: string | null | undefined,
): TipTapDocument {
  const normalized = normalizeTipTapDocument(input);

  try {
    const parsed = JSON.parse(normalized);
    if (isTipTapDocument(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to empty doc.
  }

  return JSON.parse(EMPTY_TIPTAP_DOC) as TipTapDocument;
}
