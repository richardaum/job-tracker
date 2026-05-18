import { describe, expect, it } from "vitest";

import { rewriteLocalMarkdownLinks } from "./spec-markdown-resolve";

describe("rewriteLocalMarkdownLinks", () => {
  it("resolves ./CONVENTIONS.mdx from docs/PROJECT.mdx", () => {
    const md = "See [CONVENTIONS](./CONVENTIONS.mdx).";
    const out = rewriteLocalMarkdownLinks(md, "docs/PROJECT.mdx");
    expect(out).toBe(
      "See [CONVENTIONS](?path=/docs/documentation-conventions--docs).",
    );
  });

  it("resolves ./COSTS.mdx from docs/PROJECT.mdx", () => {
    const md = "[Costs](./COSTS.mdx)";
    const out = rewriteLocalMarkdownLinks(md, "docs/PROJECT.mdx");
    expect(out).toBe("[Costs](?path=/docs/documentation-costs--docs)");
  });

  it("preserves #hash", () => {
    const md = "[x](./COSTS.mdx#foo)";
    const out = rewriteLocalMarkdownLinks(md, "docs/PROJECT.mdx");
    expect(out).toBe("[x](?path=/docs/documentation-costs--docs#foo)");
  });

  it("leaves http links unchanged", () => {
    const md = "[a](https://example.com/doc.md)";
    expect(rewriteLocalMarkdownLinks(md, "docs/PROJECT.mdx")).toBe(md);
  });

  it("leaves links with no matching docs Meta title", () => {
    const md = "[x](./STANDALONE_SCRIPTS.md)";
    expect(rewriteLocalMarkdownLinks(md, "docs/PROJECT.mdx")).toBe(md);
  });
});
