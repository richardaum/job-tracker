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
| PM2, ports, per-app `.env`, registry | `.agents/rules/ops-docker-pm2.md` |
| `pnpm worktree:setup` / `teardown` flows | `.agents/skills/worktree-env/SKILL.md` (`@worktree-env`; explicit invocation only) |
| Subagent loop (A → B, 2 passes) | `.agents/skills/worktree-loop/SKILL.md` (`@worktree-loop` / `/worktree-loop`) |
| CLI implementation / flags | `packages/worktree-cli/README.md` (`@job-tracker/worktree-cli`) |

## Execution pipeline (mandatory)

Feature work **inside a linked worktree** MUST use the subagent loop (**A → B → B1**). Load and follow **`.agents/skills/worktree-loop/SKILL.md`**:

- Invoke **`@worktree-loop`** or **`/worktree-loop`** at the start of each task unit (Compozy task, PRD slice, or scoped request).
- Main thread **orchestrates only** — no direct implementation or review.
- Acceptance: **2 code-review passes** (two parallel reviewers, both pass); on failure, loop per skill § B1.

## Reintegration — feature documentation lookup

Before merging a worktree branch into `main`, **discover and read** the feature documentation using the **worktree identifier** (directory name or branch slug). Project docs are the source of truth for scope, merge steps, conflict resolution, and follow-up work — not ad-hoc memory.

### 1. Resolve the feature slug

| Source | How |
| ------ | --- |
| Worktree directory name | Primary key — e.g. `job-fit-remodeling`, `improvement-404` (kebab-case). |
| Git branch | When the folder is generic (`job-tracker`), use `git branch --show-current`. Prefer `task/<slug>` → slug is `<slug>`. |
| Compozy task folder | If the directory name ≠ any `.compozy/tasks/<slug>/`, search task folders and `memory/MEMORY.md` for the worktree path or branch name. |

### 2. Where to look (search order)

| Location | Use for reintegration |
| -------- | --------------------- |
| `.compozy/tasks/<slug>/` | `_prd.md`, `_techspec.md`, `_tasks.md`, `adrs/`, `reviews-NNN/`, acceptance gates, post-merge commands, worktree env contract |
| `specs/` (linked from PRD) | Canonical product/technical scope, rename maps, API contracts, traceability IDs |
| `plans/` | Ad-hoc implementation plans — grep for slug or feature keywords |
| `.compozy/tasks/<slug>/memory/` | Runtime decisions, deferred items, execution notes |

From the worktree root, widen search when the slug alone is insufficient:

```bash
rg -l '<slug>' .compozy plans specs
```

Also read `git diff main...HEAD --stat` and cross-check touched paths against PRD/techspec scope — that surfaces likely **merge conflicts** and files another worktree may have edited.

### 3. What to extract before merge

From the documentation above (and the branch diff):

- **Scope summary** — what changed (entities, routes, enums, migrations, renames).
- **Branch / merge strategy** — stated in techspec or PRD, if any.
- **Conflict hotspots** — domains and files both branches touch; use docs + diff to resolve conflicts consistently with the feature intent (e.g. keep rename direction from the PRD, not a stale symbol from `main`).
- **Post-merge steps** — migrations, datafix scripts, codegen, verification commands (often in `_techspec.md`, `_tasks.md`, or PRD acceptance gates).
- **Follow-up work** — see below; record in Compozy task files or specs, not only in merge notes.

### 4. Follow-up work

Follow-up work is **continuation work** started in the worktree but **not finished at merge time** because of **drift** or **parallel changes**:

- **Drift:** `main` or another worktree landed changes that partially undo or bypass this branch's conventions. Example: every `X_` prefix was removed in this worktree, but `main` later added a new symbol still using `X_` → follow-up: remove `X_` on that new symbol.
- **Deferred scope:** tasks marked incomplete in `_tasks.md`, or open items under `reviews-NNN/`.
- **Cross-worktree overlap:** another active worktree owns the same files — coordinate merge order or schedule a small follow-up PR after both land.

Record follow-up items in `.compozy/tasks/<slug>/_tasks.md` or `memory/MEMORY.md`, or in a LeanSpec / `plans/` entry when the work spans features.

### Do not

- Merge without reading the Compozy task and linked specs for that slug.
- Drop follow-up work only in ephemeral chat; persist it in task memory or `_tasks.md`.
