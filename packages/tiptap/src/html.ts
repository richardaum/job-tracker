import { tryRun } from "@job-tracker/try-run";

import { normalizeTipTapDocument } from "./normalize";
import type { TipTapNode } from "./types";

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
    const content = Array.isArray(node.content) ? node.content.map(renderInline).join("") : "";
    return `<p>${content}</p>`;
  }

  if (node.type === "heading") {
    const level = Math.min(
      6,
      Math.max(1, Number((node as { attrs?: { level?: unknown } }).attrs?.level ?? 1)),
    );
    const content = Array.isArray(node.content) ? node.content.map(renderInline).join("") : "";
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

  const [err, parsed] = tryRun(() => JSON.parse(normalized) as TipTapNode);
  if (err || !parsed) {
    return "";
  }
  const blocks = Array.isArray(parsed.content) ? parsed.content : [];
  return blocks.map(renderBlock).join("");
}
