# Specs (LeanSpec)

Numbered folders **`specs/NNN-slug/`**, primary file **`README.md`**. Bands: **`001-*`…`006-*`** archived; **`007-*`…`011-*`** docs governance; **`012-*`…`024-*`** current product / technical scope.

## Generated index (`INDEX.md`)

- **[INDEX.md](./INDEX.md)** — **YAML frontmatter** counts: **`specCount`**, **`requirementIdCount`**, **`historyCount`**

Regenerate **`specs/INDEX.md`**: **`pnpm leanspec:sync-spec-indices`**. CI: **`pnpm leanspec:sync-spec-indices -- --check`**.

See **`docs/CONVENTIONS.mdx`** (**Spec indices**).

## Commands (repository root)

```bash
pnpm exec lean-spec list
pnpm exec lean-spec board
pnpm exec lean-spec validate
pnpm leanspec:validate
pnpm leanspec:sync-spec-indices
pnpm leanspec:sync-spec-indices -- --check
```

Details: **`specs/007-docs-definition/README.md`**, **`docs/CONVENTIONS.mdx`**.
