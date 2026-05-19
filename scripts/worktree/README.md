# Worktree scripts

CLI helpers to run **api + web + storybook + extension** in a [git worktree](https://git-scm.com/docs/git-worktree) alongside the main checkout. Isolation uses dedicated ports, a cloned PostgreSQL database (`job_tracker_<slug>`), PM2 name prefix, and root `.env.worktree` (gitignored).

Scripts are **flag-only** — no stdin prompts. Safe for agents and CI-style automation.

## Prerequisites

- Run from a **linked worktree** checkout (not the main repo root). Both scripts call `assertGitWorktree` and exit on the main checkout.
- Source DB name: `WORKTREE_SOURCE_DB` or `--source-db=…` (typically `job_tracker`).
- Main checkout `apps/api/.env` must exist (secrets are copied from there).
- PostgreSQL reachable locally or via Docker (`docker compose` postgres service, or `WORKTREE_POSTGRES_DOCKER`).

Slug is derived from the worktree directory name (kebab-case, ≤16 chars) or from the current branch when the folder is still named `job-tracker`.

## Commands

From the **worktree root**:

```bash
export WORKTREE_SOURCE_DB=job_tracker

# Setup — dry-run first, then apply
pnpm worktree:setup -- --dry-run --source-db job_tracker --all --dbeaver
pnpm worktree:setup -- --source-db job_tracker --all --dbeaver

# Teardown — requires --dry-run or --apply
pnpm worktree:teardown -- --dry-run
pnpm worktree:teardown -- --apply --dbeaver
```

Direct invocation (repo root as cwd is resolved from script location):

```bash
node --experimental-strip-types scripts/worktree/setup.ts -- --dry-run
node --experimental-strip-types scripts/worktree/teardown.ts -- --dry-run
```

## Setup flags

| Flag               | Effect                                                   |
| ------------------ | -------------------------------------------------------- |
| `--dry-run`        | Print plan only (no writes, no post-steps)               |
| `--source-db=NAME` | Database to clone (default: `WORKTREE_SOURCE_DB`)        |
| `--recreate-db`    | Drop and re-clone destination DB                         |
| `--dbeaver`        | Add DBeaver connection under Job Tracker/Worktrees       |
| `--force-dbeaver`  | Replace existing DBeaver connection for this slug        |
| `--install`        | `pnpm install` (after core setup)                        |
| `--migrate`        | `pnpm --filter @job-tracker/api run db:migrate`          |
| `--start`          | `pnpm pm2:start`                                         |
| `--verify`         | curl API/Web/Storybook/WXT (WXT failure is warning only) |
| `--all`            | `--install --migrate --start --verify`                   |

**Core setup** (when not `--dry-run`): clone DB → allocate ports → write `.env.worktree` → optional DBeaver → optional post-steps.

Re-running setup is idempotent: ports reused from `/tmp/job-tracker-ports.json`, DB clone skipped if the database already exists (unless `--recreate-db`).

## Teardown flags

| Flag        | Effect                                               |
| ----------- | ---------------------------------------------------- |
| `--dry-run` | Print plan only                                      |
| `--apply`   | Execute teardown (required if not dry-run)           |
| `--keep-db` | Do not drop `job_tracker_<slug>`                     |
| `--drop-db` | Drop DB (default)                                    |
| `--dbeaver` | Remove DBeaver connection                            |
| `[slug]`    | Optional positional slug (else from `.env.worktree`) |

**Apply order:** PM2 delete → DBeaver (if flagged) → dropdb → port registry → remove `.env.worktree`.

`git worktree remove` is **not** automated — see stderr hint after teardown.

## Environment variables

| Variable                        | Purpose                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `WORKTREE_SOURCE_DB`            | Default `--source-db` for setup                                                  |
| `WORKTREE_POSTGRES_DOCKER`      | Force Postgres container name/id                                                 |
| `WORKTREE_POSTGRES_USER`        | Postgres role (default `postgres`)                                               |
| `WORKTREE_DBEAVER_DATA_SOURCES` | Override `data-sources.json` path (macOS default under `~/Library/DBeaverData/`) |

## Artifacts

| Path                                 | Role                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `.env.worktree`                      | Ports, `DATABASE_URL`, auth bypass, PM2 prefix — loaded by `ecosystem.config.cjs` |
| `/tmp/job-tracker-ports.json`        | Global slug → port map                                                            |
| `/tmp/job-tracker-<slug>.ports.json` | Per-slug port cache                                                               |

Main checkout ports **3100, 3101, 6006, 3001** are reserved and never assigned to worktrees.

## Layout

| File          | Role                                                                  |
| ------------- | --------------------------------------------------------------------- |
| `setup.ts`    | Setup orchestrator                                                    |
| `teardown.ts` | Teardown orchestrator                                                 |
| `lib.ts`      | Git guards, ports, DB clone/drop, env, PM2, CLI parsing, post-steps   |
| `dbeaver.ts`  | Read/write DBeaver `data-sources.json` (passwords not stored in JSON) |
| `*.test.ts`   | Unit tests (`pnpm test:scripts`)                                      |

Agent rules: `.agents/rules/worktree.md`. Setup/teardown skill: `.agents/skills/worktree-env/SKILL.md`. PM2/ports: `.agents/rules/ops-docker-pm2.md`.
