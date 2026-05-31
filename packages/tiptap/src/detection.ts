import { tryRun } from "@job-tracker/try-run";

export function isTipTapDocumentString(input: string): boolean {
  const [err, parsed] = tryRun(
    () => JSON.parse(input) as { type?: unknown; content?: unknown },
  );
  if (err) {
    return false;
  }
  return parsed.type === "doc" && Array.isArray(parsed.content);
}
