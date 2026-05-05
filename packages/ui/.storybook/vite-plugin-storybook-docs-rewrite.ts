import path from "node:path";

import type { Plugin } from "vite";

import { rewriteSpecMarkdownForStorybook } from "#ui/stories/spec-markdown-resolve.ts";

/**
 * Runs before MDX compile: rewrites LeanSpec traceability tokens and relative
 * Markdown links under the repo `docs/` tree so Storybook in-app navigation works.
 */
export function storybookDocsRewritePlugin(repoRoot: string): Plugin {
  return {
    name: "storybook-docs-local-md-links",
    enforce: "pre",
    transform(src: string, id: string) {
      const cleanId = id.split("?")[0];
      if (!cleanId.endsWith(".mdx")) {
        return null;
      }
      const rel = path.relative(repoRoot, cleanId).replace(/\\/g, "/");
      if (!rel.startsWith("docs/")) {
        return null;
      }
      if (typeof src !== "string") {
        return null;
      }
      const next = rewriteSpecMarkdownForStorybook(src, rel);
      if (next === src) {
        return null;
      }
      return { code: next, map: null };
    },
  };
}
