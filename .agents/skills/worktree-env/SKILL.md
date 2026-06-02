---
name: worktree-env
description: >-
  Run worktree parallel dev setup or teardown in job-tracker (`setup` or
  `teardown`). Explicit invocation only — load when the user names
  `@worktree-env` (or `/worktree-env`). Do not auto-invoke for worktree, port,
  PM2, per-app `.env`, or DBeaver questions.
disable-model-invocation: true
argument-hint: setup|teardown
---

# Worktree Env

**Explicit invocation only.** Follow this skill only when the user invokes `@worktree-env` (or `/worktree-env`) with `setup` or `teardown`. If they mention worktrees, ports, PM2, or per-app `.env` without that invocation, do not apply this skill — answer from docs/rules or ask them to invoke it.

Run **api + web + storybook + extension** in this git worktree alongside the main checkout. Isolation via ports, PostgreSQL database name, and PM2 name prefix.

CLI: **`@job-tracker/worktree-cli`** (`packages/worktree-cli/`). Commands: `pnpm worktree:setup` / `pnpm worktree:teardown`. Flag reference: `packages/worktree-cli/README.md`.

## Invocation

| Argument   | Action                                                 |
| ---------- | ------------------------------------------------------ |
| `setup`    | Dry-run, then apply with `--dry-run=false`             |
| `teardown` | Dry-run, then apply with `--apply=true`                |

If argument is missing or not `setup` / `teardown`, stop and ask.

## Setup

1. **Dry-run:** `pnpm worktree:setup -- --dry-run=true --source-db=<name>`
2. **Apply:** same flags, flip to `--dry-run=false`. Add post-steps as needed (e.g. `--install=true --migrate=true --start=true --verify=true`).

The script handles: git worktree guard, slug derivation, DB clone, port allocation, `.env` generation, VS Code workspace, DBeaver connections, and post-steps sequencing. Idempotent: reuses port registry when free, skips DB clone if DB exists.

## Teardown

1. **Dry-run:** `pnpm worktree:teardown -- --dry-run=true --apply=false`
2. **Apply:** `pnpm worktree:teardown -- --dry-run=false --apply=true`

After teardown (manual): `git worktree remove <path>`, `git branch -D <slug>`.

## Constraints (not enforced by script)

- `pnpm pm2:reset` / `pnpm ports:kill` refused inside a worktree without `PM2_RESET_PORTS` set to worktree port list
- Auth: `AUTH_BYPASS_ENABLED=true` — no new Google OAuth redirect URIs needed
- After setup, confirm main checkout still works on default ports (3100/3101/6006/3001)
- Before `--migrate=true`: check migration file order under `apps/api/src/database/migrations/`

## Related rules

| Topic                               | File                                       |
| ----------------------------------- | ------------------------------------------ |
| Worktrees, code-agent handoff       | `.agents/rules/ops/worktree.md`                |
| PM2, worktree registry, port policy | `.agents/rules/ops/docker-pm2.md`          |
| CLI flags, package layout           | `packages/worktree-cli/README.md`          |
| Migrations                          | `.agents/rules/backend/database.md` |
| Lint/typecheck/test                 | `.agents/rules/ops/validation.md`              |
