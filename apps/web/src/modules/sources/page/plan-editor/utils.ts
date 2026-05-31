import type { CollectJobsInput, ParseRegexInput } from "./types";

export function defaultCollectJobs(): CollectJobsInput {
  return {
    containerSelector: "",
    itemSelector: "",
    detailsUrlField: "",
    direction: "down",
    parallelDetailsTabs: 1,
    surfaceFields: [],
    detailsFields: [],
  };
}

export function defaultParseRegex(): ParseRegexInput {
  return { text: "", fields: [] };
}

export function updateField<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

// ─── Template parsing ──────────────────────────────────────────

export type TemplateToken =
  | { kind: "text"; value: string }
  | { kind: "field"; value: string; valid: boolean };

function tokenize(value: string): string[][] {
  const parts: string[][] = [];
  let i = 0;
  while (i < value.length) {
    const open = value.indexOf("{{", i);
    if (open === -1) {
      parts.push(["text", value.slice(i)]);
      break;
    }
    if (open > i) parts.push(["text", value.slice(i, open)]);
    i = open + 2;
    const close = value.indexOf("}}", i);
    if (close === -1) {
      parts.push(["unclosed", value.slice(i)]);
      break;
    }
    parts.push(["field", value.slice(i, close)]);
    i = close + 2;
  }
  return parts;
}

function parseTokens(value: string): TemplateToken[] {
  return tokenize(value).map(([kind, content]) => {
    if (kind === "field") return { kind: "field", value: content, valid: false };
    return {
      kind: "text",
      value: kind === "unclosed" ? `{{${content}` : content,
    };
  });
}

export function validateTokens(
  value: string,
  validKeys: Set<string>,
): { tokens: TemplateToken[]; error: string | null } {
  const tokens = parseTokens(value).map((t) =>
    t.kind === "field" ? { ...t, valid: validKeys.has(t.value) } : t,
  );

  const raw = tokens.map((t) => (t.kind === "text" ? t.value : `{{${t.value}}}`)).join("");
  const stack: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "{" && raw[i + 1] === "{") {
      stack.push(i);
      i++;
    } else if (raw[i] === "{" && raw[i + 1] !== "{") {
      return { tokens, error: "Single { is not valid" };
    } else if (raw[i] === "}" && raw[i + 1] === "}") {
      if (stack.length === 0) return { tokens, error: "Unexpected }} without {{" };
      const openPos = stack.pop()!;
      if (raw.slice(openPos + 2, i) === "") return { tokens, error: "Empty field name" };
      i++;
    } else if (raw[i] === "}" && raw[i + 1] !== "}") {
      return { tokens, error: "Single } is not valid" };
    }
  }
  if (stack.length > 0) return { tokens, error: "Unclosed {{ }}" };
  for (const t of tokens) {
    if (t.kind === "field" && !t.valid) return { tokens, error: `Unknown field "${t.value}"` };
  }
  return { tokens, error: null };
}

/** Detect if cursor is inside `{{ }}` and return the partial typed so far. */
export function autocompleteAt(
  value: string,
  cursor: number,
): { prefix: string; partial: string } | null {
  const before = value.slice(0, cursor);
  const lastOpen = before.lastIndexOf("{{");
  if (lastOpen === -1) return null;
  const inside = before.slice(lastOpen + 2);
  if (inside.includes("}}")) return null;
  return { prefix: value.slice(0, lastOpen), partial: inside };
}
