export const EMPTY_TIPTAP_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

type TipTapNode = { type?: string; text?: string; content?: TipTapNode[] };

type PlainTextListMatch =
  | { listType: "bulletList"; itemText: string }
  | { listType: "orderedList"; itemText: string };

function parsePlainTextListItem(line: string): PlainTextListMatch | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
  if (bulletMatch) {
    return { listType: "bulletList", itemText: bulletMatch[1] };
  }

  const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
  if (orderedMatch) {
    return { listType: "orderedList", itemText: orderedMatch[1] };
  }

  return null;
}

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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(node: TipTapNode): string {
  if (node.type === "text") {
    let text = escapeHtml(node.text ?? "");
    const marks = Array.isArray((node as { marks?: unknown }).marks)
      ? ((node as { marks?: Array<{ type?: string }> }).marks ?? [])
      : [];

    for (const mark of marks) {
      if (mark.type === "bold") {
        text = `<strong>${text}</strong>`;
      } else if (mark.type === "italic") {
        text = `<em>${text}</em>`;
      } else if (mark.type === "strike") {
        text = `<s>${text}</s>`;
      } else if (mark.type === "code") {
        text = `<code>${text}</code>`;
      }
    }

    return text;
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content.map(renderInline).join("");
}

function renderBlock(node: TipTapNode): string {
  if (node.type === "paragraph") {
    const content = Array.isArray(node.content)
      ? node.content.map(renderInline).join("")
      : "";
    return `<p>${content}</p>`;
  }

  if (node.type === "heading") {
    const level = Math.min(
      6,
      Math.max(
        1,
        Number((node as { attrs?: { level?: unknown } }).attrs?.level ?? 1),
      ),
    );
    const content = Array.isArray(node.content)
      ? node.content.map(renderInline).join("")
      : "";
    return `<h${level}>${content}</h${level}>`;
  }

  if (node.type === "bulletList" || node.type === "orderedList") {
    const listTag = node.type === "bulletList" ? "ul" : "ol";
    const items = Array.isArray(node.content) ? node.content : [];
    const renderedItems = items
      .map((item) => {
        if (item.type !== "listItem") return "";
        const itemContent = Array.isArray(item.content)
          ? item.content.map(renderBlock).join("")
          : "";
        return `<li>${itemContent}</li>`;
      })
      .join("");
    return `<${listTag}>${renderedItems}</${listTag}>`;
  }

  return "";
}

export function tipTapToHtml(input: string | null | undefined): string {
  const normalized = normalizeTipTapDocument(input);

  try {
    const parsed = JSON.parse(normalized) as TipTapNode;
    const blocks = Array.isArray(parsed.content) ? parsed.content : [];
    return blocks.map(renderBlock).join("");
  } catch {
    return "";
  }
}

export function plainTextToTipTap(input: string): string {
  const content: TipTapNode[] = [];
  let openList: {
    type: "bulletList" | "orderedList";
    items: TipTapNode[];
  } | null = null;

  function flushOpenList() {
    if (!openList || openList.items.length === 0) return;
    content.push({ type: openList.type, content: openList.items });
    openList = null;
  }

  for (const rawLine of input.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.trim().length === 0) {
      flushOpenList();
      continue;
    }

    const parsedListItem = parsePlainTextListItem(line);
    if (parsedListItem) {
      if (!openList || openList.type !== parsedListItem.listType) {
        flushOpenList();
        openList = { type: parsedListItem.listType, items: [] };
      }

      openList.items.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: parsedListItem.itemText }],
          },
        ],
      });
      continue;
    }

    flushOpenList();
    content.push({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    });
  }

  flushOpenList();

  if (content.length === 0) {
    return EMPTY_TIPTAP_DOC;
  }

  return JSON.stringify({ type: "doc", content });
}

type TipTapDocument = { type: "doc"; content: TipTapNode[] };

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
