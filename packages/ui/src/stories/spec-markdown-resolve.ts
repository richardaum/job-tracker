import { toId } from "storybook/internal/csf";

import requirementIdMap from "./requirement-id-map.generated.json" with { type: "json" };

/** Bare `[P-12]` / `[T-57]` not already followed by `(` (i.e. not explicit markdown link open). */
const REQUIREMENT_BRACKET_RE = /\[(P|T|R|H|F)-(\d+)\](?!\()/g;

/** Matches `scripts/generate-specs-storybook.mjs` `humanizeSlug`. */
export function humanizeSlug(slug: string) {
  const rest = slug.replace(/^\d{3}-/, "");
  return rest
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Repo-root–relative POSIX path (e.g. `specs/001-foo/README.md`) → Storybook `Meta` title
 * for a docs page that exists in this Storybook config.
 */
export function filePathToDocTitle(repoPath: string): string | null {
  const p = repoPath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (p === "specs/README.md") return "Documentation/Specs/Overview";
  if (p === "specs/HISTORY.md") return "Documentation/Specs/History";
  if (p === "specs/INDEX.md") return "Documentation/Specs/Generated index";

  const specReadme = p.match(/^specs\/(\d{3}-[a-z0-9-]+)\/README\.md$/);
  if (specReadme) {
    const folder = specReadme[1];
    const id = folder.slice(0, 3);
    return `Documentation/Specs/${id} — ${humanizeSlug(folder)}`;
  }

  if (p === "docs/PROJECT.mdx") return "Documentation/Project";
  if (p === "docs/CONVENTIONS.mdx") return "Documentation/Conventions";
  if (p === "docs/COSTS.mdx") return "Documentation/Costs";

  if (p === "docs/specs/HISTORY.mdx") return "Documentation/Specs/History";
  if (p === "docs/specs/INDEX.mdx")
    return "Documentation/Specs/Generated index";
  if (p === "docs/specs/OVERVIEW.mdx") return "Documentation/Specs/Overview";

  const dsm = p.match(/^docs\/specs\/(\d{3}-[a-z0-9-]+)\.mdx$/);
  if (dsm) {
    const base = dsm[1];
    const id = base.slice(0, 3);
    return `Documentation/Specs/${id} — ${humanizeSlug(base)}`;
  }

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
/**
 * Turn traceability tokens like `[T-57]` into Storybook doc links when the id is listed in
 * `requirement-id-map.generated.json` (built from `- [X-NNN]` definition lines under `specs/`).
 */
export function rewriteRequirementCrossReferences(
  markdown: string,
  map: Record<string, string> = requirementIdMap as Record<string, string>,
) {
  return markdown.replace(
    REQUIREMENT_BRACKET_RE,
    (full, kind: string, num: string) => {
      const id = `${kind}-${num}`;
      const repoPath = map[id];
      if (!repoPath) {
        return full;
      }
      const docTitle = filePathToDocTitle(repoPath);
      if (!docTitle) {
        return full;
      }
      const href = docTitleToStorybookHref(docTitle);
      return `[${id}](${href})`;
    },
  );
}

/** Requirement cross-refs first, then relative `.md` / `.mdx` links (same source file). */
export function rewriteSpecMarkdownForStorybook(
  markdown: string,
  sourceFile: string,
) {
  let body = rewriteRequirementCrossReferences(markdown);
  body = rewriteLocalMarkdownLinks(body, sourceFile);
  return body;
}

export function rewriteLocalMarkdownLinks(
  markdown: string,
  sourceFile: string,
) {
  return markdown.replace(
    /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g,
    (full, text, rawUrl: string) => {
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
    },
  );
}
