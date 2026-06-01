import { isTipTapDocumentString } from "./detection";
import { plainTextToTipTap } from "./plain-text";
import { EMPTY_TIPTAP_DOC } from "./types";
import { isRecord } from "./utils";

function fixTipTapNodes(node: unknown): unknown {
  if (!isRecord(node)) return node;

  const fixed: Record<string, unknown> = { ...node };

  if (fixed.type === "list") {
    const attrs = isRecord(fixed.attrs) ? fixed.attrs : {};
    fixed.type = attrs.ordered === true ? "orderedList" : "bulletList";
    delete fixed.attrs;
  }

  if (Array.isArray(fixed.content)) {
    fixed.content = fixed.content.map(fixTipTapNodes);
  }

  return fixed;
}

export function normalizeTipTapDocument(input: string | null | undefined): string {
  if (!input) return EMPTY_TIPTAP_DOC;
  const text = input.trim();
  if (!text) return EMPTY_TIPTAP_DOC;
  if (!isTipTapDocumentString(text)) return plainTextToTipTap(text);

  const parsed = JSON.parse(text);
  const fixed = fixTipTapNodes(parsed);
  return JSON.stringify(fixed);
}
