# Worktree Reintegration

## `WORKTREE.md` — temporary reintegration manifest

A worktree branch may carry a **`WORKTREE.md`** at the repository root. This file is a **temporary, human-readable integration note** authored inside the worktree before reintegration into `main`.

### Purpose

- **What** is being merged (feature, fix, refactor — 2–3 sentences).
- **How** to reintegrate: branch name, merge strategy preference, known conflict areas, migration dependencies, post-merge steps.
- **Followup work** remaining after merge (if any): related tasks, deferred items, manual verification needed.

### Lifecycle

1. **Authored in the worktree branch** — committed alongside the work. Purpose: communicate intent to whoever merges (author or reviewer).
2. **Merged into `main`** alongside the branch diff — merge preserves the file.
3. **Read and followed** — the person doing the merge reads `WORKTREE.md`, follows its instructions.
4. **Removed from `main` after reintegration** — the file must NOT persist in `main`. Delete it in a cleanup commit after integration is confirmed.

### Format

Markdown, no frontmatter. 1–3 short sections. Example:

```markdown
# Worktree reintegration — app-fit-rename

**What:** Renamed `Application` → `Job` and `FitAnalysis` → `MatchAnalysis`
across GraphQL schema, entities, web modules, routes, and tests.

**Reintegration:** Fast-forward from `task/app-fit-rename` onto `main`.
No known conflicts. After merge, run:
- `pnpm --filter @job-tracker/api run db:migrate`
- `pnpm --filter @job-tracker/api run codegen`
- `pnpm typecheck`

**Followup:** E2E tests pending — run `pnpm e2e` and verify.
```

### Do not

- Commit `WORKTREE.md` directly to `main` (outside a merge).
- Leave `WORKTREE.md` in `main` after reintegration is complete.
- Use `WORKTREE.md` for changelogs, commit messages, or permanent documentation.
