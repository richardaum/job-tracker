# Worktree

Git worktrees for parallel feature branches. Env/PM2 setup is separate from reintegration notes.

## Code agent handoff (mandatory)

Whenever you **create**, **reference**, or **hand off** a linked worktree path, end the response with **one** copy-pasteable inline shell command:

```bash
cd {path} && {code-agent}
```

- **`{path}`** — absolute filesystem path to the worktree root (`git rev-parse --show-toplevel` from that checkout, or the path you just created).
- **`{code-agent}`** — CLI for the coding agent the user chose (see table below). Do not invent a default.

### Ask which code agent

If the user has not said which agent they use, ask once:

> Which code agent — **OpenCode**, **Cursor**, or **Claude Code**?

| Choice        | `{code-agent}` |
| ------------- | -------------- |
| OpenCode      | `opencode`     |
| Cursor        | `cursor`       |
| Claude Code   | `claude`       |

Example (after `git worktree add` or when pointing at an existing checkout):

```bash
cd /Users/me/projects/job-tracker-worktrees/my-feature && cursor
```

Do not omit this line when the task involves a worktree path. Do not split `cd` and the agent across multiple blocks.

## Parallel dev (env / PM2)

Setup and teardown run **inside** the linked worktree only (not the main checkout).

| Topic | Location |
| ----- | -------- |
| PM2, ports, `.env.worktree`, registry | `.agents/rules/ops-docker-pm2.md` |
| `pnpm worktree:setup` / `teardown` flows | `.agents/skills/worktree-env/SKILL.md` (`@worktree-env`; explicit invocation only) |
| CLI flags | `scripts/worktree/README.md` |

## Reintegration — `WORKTREE.md`

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
