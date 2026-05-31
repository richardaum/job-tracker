import { tryRun } from "@job-tracker/try-run";

import { normalizeTipTapDocument } from "./normalize";
import type { TipTapDocument } from "./types";
import { EMPTY_TIPTAP_DOC } from "./types";

function isTipTapDocument(value: unknown): value is TipTapDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { type?: unknown; content?: unknown };
  return candidate.type === "doc" && Array.isArray(candidate.content);
}

export function parseTipTapDocument(
  input: string | null | undefined,
): TipTapDocument {
  const normalized = normalizeTipTapDocument(input);

  const [parseErr, parsed] = tryRun(() => JSON.parse(normalized));
  if (!parseErr && isTipTapDocument(parsed)) {
    return parsed;
  }

  return JSON.parse(EMPTY_TIPTAP_DOC) as TipTapDocument;
}
