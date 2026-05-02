import { Markdown } from "@storybook/addon-docs/blocks";

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

export type SpecMarkdownProps = {
  /** Raw `README.md` / spec markdown (Vite `?raw` import). */
  raw: string;
};

/**
 * Renders LeanSpec markdown in Storybook the same way as other docs: `@storybook/addon-docs` `Markdown`
 * block, with YAML frontmatter stripped so it does not appear as visible content.
 */
export function SpecMarkdown({ raw }: SpecMarkdownProps) {
  const body = raw.replace(FRONTMATTER_RE, "").trimStart();
  return <Markdown>{body}</Markdown>;
}
