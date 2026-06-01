import type { TipTapDocument, TipTapNode } from "./types";
import { isRecord } from "./utils";

export function fixTipTapNode(node: unknown): unknown {
  if (!isRecord(node)) return node;

  const fixed: Record<string, unknown> = { ...node };

  if (fixed.type === "list") {
    const attrs = isRecord(fixed.attrs) ? fixed.attrs : {};
    fixed.type = attrs.ordered === true ? "orderedList" : "bulletList";
    delete fixed.attrs;
  }

  if (Array.isArray(fixed.content)) {
    fixed.content = fixed.content.map(fixTipTapNode);
  }

  return fixed;
}

export function normalizeAITipTapDocument(doc: TipTapDocument): TipTapDocument {
  const content = Array.isArray(doc.content) ? doc.content : [];
  return { ...doc, content: content.map((node) => fixTipTapNode(node) as TipTapNode) };
}
