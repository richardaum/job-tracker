import { Markdown } from "@storybook/addon-docs/blocks";

import { rewriteSpecMarkdownForStorybook } from "./spec-markdown-resolve";

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

export type SpecMarkdownProps = {
  /** Raw `README.md` / spec markdown (Vite `?raw` import). */
  raw: string;
  /**
   * Repo-root–relative path to the markdown file (e.g. `specs/001-foo/README.md`).
   * Used to resolve `[text](./other.md)` and `../` links to Storybook docs routes.
   */
  sourceFile: string;
};

/**
 * Renders LeanSpec markdown in Storybook the same way as other docs: `@storybook/addon-docs` `Markdown`
 * block, with YAML frontmatter stripped so it does not appear as visible content.
 * Bare `[P-NNN]` / `[T-NNN]` traceability tokens and relative `.md` / `.mdx` links are rewritten
 * to `?path=/docs/...` so in-doc navigation works.
 */
export function SpecMarkdown({ raw, sourceFile }: SpecMarkdownProps) {
  let body = raw.replace(FRONTMATTER_RE, "").trimStart();
  body = rewriteSpecMarkdownForStorybook(body, sourceFile);
  return <Markdown>{body}</Markdown>;
}
