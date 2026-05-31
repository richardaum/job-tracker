import { marked, type Token } from "marked";

import type { TipTapNode } from "./types";

function inlineToNodes(tokens: Token[]): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  for (const token of tokens) {
    if (token.type === "text") {
      nodes.push({ type: "text", text: token.text });
    } else if (token.type === "strong") {
      nodes.push({
        type: "text",
        text: (token as Token & { tokens: Token[] }).tokens
          .filter((t): t is Token & { type: "text" } => t.type === "text")
          .map((t) => t.text)
          .join(""),
        marks: [{ type: "bold" }],
      });
    } else if (token.type === "em") {
      nodes.push({
        type: "text",
        text: (token as Token & { tokens: Token[] }).tokens
          .filter((t): t is Token & { type: "text" } => t.type === "text")
          .map((t) => t.text)
          .join(""),
        marks: [{ type: "italic" }],
      });
    } else if (token.type === "codespan") {
      nodes.push({ type: "text", text: token.text, marks: [{ type: "code" }] });
    } else if (token.type === "link") {
      const linkToken = token as Token & { tokens: Token[]; href: string };
      const text = linkToken.tokens
        .filter((t): t is Token & { type: "text" } => t.type === "text")
        .map((t) => t.text)
        .join("");
      nodes.push({
        type: "text",
        text: text || linkToken.href,
        marks: [{ type: "link", attrs: { href: linkToken.href } }],
      });
    }
  }

  return nodes;
}

function blockToNode(token: Token): TipTapNode | null {
  if (token.type === "paragraph") {
    const content = inlineToNodes((token as Token & { tokens: Token[] }).tokens);
    if (content.length === 0) return null;
    return { type: "paragraph", content };
  }

  if (token.type === "heading") {
    const heading = token as Token & { depth: number; tokens: Token[] };
    const content = inlineToNodes(heading.tokens);
    return { type: "heading", attrs: { level: heading.depth }, content: content.length > 0 ? content : undefined };
  }

  if (token.type === "list") {
    const list = token as Token & { items: Token[]; ordered: boolean };
    const items: TipTapNode[] = [];
    for (const item of list.items) {
      const itemToken = item as Token & { tokens: Token[] };
      const itemContent = itemToken.tokens.map((t) => blockToNode(t)).filter((n): n is TipTapNode => n !== null);
      if (itemContent.length > 0) {
        items.push({ type: "listItem", content: itemContent });
      }
    }

    if (items.length === 0) return null;
    return { type: list.ordered ? "orderedList" : "bulletList", content: items };
  }

  return null;
}

export function markdownToTipTap(input: string): string {
  const tokens = marked.lexer(input);
  const content: TipTapNode[] = [];

  for (const token of tokens) {
    const node = blockToNode(token);
    if (node) content.push(node);
  }

  if (content.length === 0) {
    return JSON.stringify({ type: "doc", content: [] });
  }

  return JSON.stringify({ type: "doc", content });
}
