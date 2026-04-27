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
