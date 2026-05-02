# Specs (LeanSpec)

Numbered specification folders for this project. Primary file per spec: **`README.md`**.

**`001-*` … `006-*`** — archived earlier-phase snapshots (**`status: archived`**). **`007-*` … `011-*`** — consolidated **`docs-*`** governance (definition, history + `HISTORY.md`, project, roadmap, state). **`012-*` … `022-*`** — active **product** and **technical** scopes.

## Commands (from repository root)

```bash
pnpm exec lean-spec list
pnpm exec lean-spec board
pnpm exec lean-spec validate
pnpm leanspec:validate
```

Create or update specs with `pnpm exec lean-spec create …`, `pnpm exec lean-spec update …`, etc.

## Layout

```
specs/
├── 001-* … 006-*                     # archived prior-phase product/technical snapshots
├── 007-docs-definition/
├── 008-docs-history/
│   ├── README.md
│   └── HISTORY.md
├── 009-docs-project/
├── 010-docs-roadmap/
├── 011-docs-state/
├── 012-* …                         # active product / technical scopes
├── …
```

## Status values (frontmatter)

Common values: `draft`, `planned`, `in-progress`, `complete`, `archived`.

## Docs

- [leanspec.dev](https://leanspec.dev)
- Conventions (**LeanSpec** + code): **`docs/CONVENTIONS.mdx`** (Storybook → Documentation → Conventions). Governance pointer: `specs/007-docs-definition/README.md`.
- Project definition (readable overview): **`docs/PROJECT.mdx`** (Storybook → **Documentation → Project**); LeanSpec anchor: **`specs/009-docs-project/README.md`**.
