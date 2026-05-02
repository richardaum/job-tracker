import { describe, expect, it } from "vitest";

import {
  rewriteLocalMarkdownLinks,
  rewriteRequirementCrossReferences,
} from "./spec-markdown-resolve";

describe("rewriteLocalMarkdownLinks", () => {
  it("resolves ./INDEX.md from specs/README.md", () => {
    const md = "See [index](./INDEX.md).";
    const out = rewriteLocalMarkdownLinks(md, "specs/README.md");
    expect(out).toBe(
      "See [index](?path=/docs/documentation-specs-generated-index--docs).",
    );
  });

  it("resolves ../HISTORY.md from a numbered spec README", () => {
    const md = "[H](../HISTORY.md)";
    const out = rewriteLocalMarkdownLinks(
      md,
      "specs/008-docs-history/README.md",
    );
    expect(out).toBe("[H](?path=/docs/documentation-specs-history--docs)");
  });

  it("resolves ../../docs/PROJECT.mdx from a spec README", () => {
    const md = "[P](../../docs/PROJECT.mdx)";
    const out = rewriteLocalMarkdownLinks(
      md,
      "specs/009-docs-project/README.md",
    );
    expect(out).toBe("[P](?path=/docs/documentation-project--docs)");
  });

  it("preserves #hash", () => {
    const md = "[x](./INDEX.md#foo)";
    const out = rewriteLocalMarkdownLinks(md, "specs/README.md");
    expect(out).toBe(
      "[x](?path=/docs/documentation-specs-generated-index--docs#foo)",
    );
  });

  it("leaves http links unchanged", () => {
    const md = "[a](https://example.com/doc.md)";
    expect(rewriteLocalMarkdownLinks(md, "specs/README.md")).toBe(md);
  });
});

describe("rewriteRequirementCrossReferences", () => {
  it("links bare [T-57] to the owning spec docs route", () => {
    const map = {
      "T-57": "specs/020-technical-tracking-data-model-and-workflows/README.md",
    };
    const md = "See [T-57] for the model.";
    const out = rewriteRequirementCrossReferences(md, map);
    expect(out).toBe(
      "See [T-57](?path=/docs/documentation-specs-020-technical-tracking-data-model-and-workflows--docs) for the model.",
    );
  });

  it("does not wrap tokens that already start a markdown link", () => {
    const map = {
      "T-57": "specs/020-technical-tracking-data-model-and-workflows/README.md",
    };
    const md = "[T-57](?path=/docs/foo--docs)";
    expect(rewriteRequirementCrossReferences(md, map)).toBe(md);
  });

  it("leaves unknown ids unchanged", () => {
    const md = "Mention [T-999999].";
    expect(rewriteRequirementCrossReferences(md, {})).toBe(md);
  });
});
