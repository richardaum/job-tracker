import { toId } from "storybook/internal/csf";

/**
 * Repo-root–relative POSIX path → Storybook `Meta` title for docs MDX in this config.
 */
export function filePathToDocTitle(repoPath: string): string | null {
  const p = repoPath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (p === "docs/PROJECT.mdx") return "Documentation/Project";
  if (p === "docs/CONVENTIONS.mdx") return "Documentation/Conventions";
  if (p === "docs/COSTS.mdx") return "Documentation/Costs";

  return null;
}

function posixDirname(p: string) {
  const i = p.lastIndexOf("/");
  return i <= 0 ? "" : p.slice(0, i);
}

/** Resolve `rel` against `sourceFile` (repo-relative POSIX path to the current `.md`). */
export function resolveRepoRelative(sourceFile: string, rel: string): string {
  const baseDir = posixDirname(sourceFile.replace(/\\/g, "/"));
  const parts = [...(baseDir ? baseDir.split("/") : []), ...rel.split("/")];
  const out: string[] = [];
  for (const s of parts) {
    if (s === "" || s === ".") continue;
    if (s === "..") out.pop();
    else out.push(s);
  }
  return out.join("/");
}

const LOCAL_MD = /\.(?:md|mdx)$/i;

function isLocalMarkdownHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  if (!LOCAL_MD.test(trimmed.split("#")[0]?.split("?")[0] ?? "")) return false;
  return true;
}

/** `?path=/docs/<storyId>` — same shape Storybook uses for sidebar / in-app navigation. */
export function docTitleToStorybookHref(title: string) {
  const storyId = `${toId(title)}--docs`;
  return `?path=/docs/${storyId}`;
}

/**
 * Rewrite markdown `[text](./foo.md)` links so AnchorMdx can navigate to the target docs page.
 * Preserves `#hash` and `?query` on the URL when present.
 */
export function rewriteLocalMarkdownLinks(markdown: string, sourceFile: string) {
  return markdown.replace(/(?<!!)\[([^\]]*)\]\(([^)]+)\)/g, (full, text, rawUrl: string) => {
    const url = String(rawUrl).trim();
    const hashIdx = url.indexOf("#");
    const pathPart = hashIdx === -1 ? url : url.slice(0, hashIdx);
    const hash = hashIdx === -1 ? "" : url.slice(hashIdx);
    if (!isLocalMarkdownHref(pathPart)) return full;

    const resolved = resolveRepoRelative(sourceFile, pathPart);
    const docTitle = filePathToDocTitle(resolved);
    if (!docTitle) return full;

    const next = docTitleToStorybookHref(docTitle) + hash;
    return `[${text}](${next})`;
  });
}

/** Pre-transform MDX from repo `docs/*.mdx` for in-doc navigation in Storybook. */
export function rewriteSpecMarkdownForStorybook(markdown: string, sourceFile: string) {
  return rewriteLocalMarkdownLinks(markdown, sourceFile);
}
