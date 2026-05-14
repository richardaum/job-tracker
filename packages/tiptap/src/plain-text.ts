import { tryRun } from "@job-tracker/try-run";

import { isTipTapDocumentString } from "./detection";
import type { TipTapNode } from "./types";
import { EMPTY_TIPTAP_DOC } from "./types";

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

export function tipTapToPlainText(input: string | null | undefined): string {
  if (!input) return "";
  if (!isTipTapDocumentString(input)) return input;

  const [err, parsed] = tryRun(() => JSON.parse(input) as TipTapNode);
  if (err || !parsed || !Array.isArray(parsed.content)) return "";

  return parsed.content
    .map((block) => collectText(block))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
