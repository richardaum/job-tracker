# Worktree scripts

CLI helpers to run **api + web + storybook + extension** in a [git worktree](https://git-scm.com/docs/git-worktree) alongside the main checkout. Isolation uses dedicated ports, a cloned PostgreSQL database (`job_tracker_<slug>`), PM2 name prefix, and root `.env.worktree` (gitignored).

Scripts are **flag-only** — no stdin prompts. Every boolean flag must be passed as `--name=true` or `--name=false`. Safe for agents and CI-style automation.

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

# Setup — dry-run first, then apply (all boolean flags required)
pnpm worktree:setup -- \
  --dry-run=true \
  --recreate-db=false \
  --dbeaver=true \
  --force-dbeaver=false \
  --install=true \
  --migrate=true \
  --start=true \
  --verify=true \
  --source-db=job_tracker

pnpm worktree:setup -- \
  --dry-run=false \
  --recreate-db=false \
  --dbeaver=true \
  --force-dbeaver=false \
  --install=true \
  --migrate=true \
  --start=true \
  --verify=true \
  --source-db=job_tracker

# Teardown — all boolean flags required; exactly one of dry-run/apply must be true
pnpm worktree:teardown -- \
  --dry-run=true \
  --apply=false \
  --drop-db=true \
  --dbeaver=false

pnpm worktree:teardown -- \
  --dry-run=false \
  --apply=true \
  --drop-db=true \
  --dbeaver=true
```

Direct invocation (repo root as cwd is resolved from script location):

```bash
node --experimental-strip-types scripts/worktree/setup.ts -- \
  --dry-run=true --recreate-db=false --dbeaver=false --force-dbeaver=false \
  --install=false --migrate=false --start=false --verify=false

node --experimental-strip-types scripts/worktree/teardown.ts -- \
  --dry-run=true --apply=false --drop-db=true --dbeaver=false
```

## Setup flags

| Flag                          | Required | Effect                                                                  |
| ----------------------------- | -------- | ----------------------------------------------------------------------- |
| `--dry-run=true\|false`       | yes      | `true`: print plan only (no writes, no post-steps)                      |
| `--recreate-db=true\|false`   | yes      | `true`: drop and re-clone destination DB                                |
| `--dbeaver=true\|false`       | yes      | `true`: add DBeaver connection under Job Tracker/Worktrees              |
| `--force-dbeaver=true\|false` | yes      | `true`: replace existing DBeaver connection (requires `--dbeaver=true`) |
| `--install=true\|false`       | yes      | `true`: `pnpm install` (after core setup)                               |
| `--migrate=true\|false`       | yes      | `true`: `pnpm --filter @job-tracker/api run db:migrate`                 |
| `--start=true\|false`         | yes      | `true`: `pnpm pm2:start`                                                |
| `--verify=true\|false`        | yes      | `true`: curl API/Web/Storybook/WXT (WXT failure is warning only)        |
| `--source-db=NAME`            | no\*     | Database to clone (default: `WORKTREE_SOURCE_DB`)                       |

\*At least one of `WORKTREE_SOURCE_DB` or `--source-db=…` must be set before setup runs.

**Core setup** (when `--dry-run=false`): clone DB → allocate ports → write `.env.worktree` → optional DBeaver → optional post-steps.

Re-running setup is idempotent: ports reused from `/tmp/job-tracker-ports.json`, DB clone skipped if the database already exists (unless `--recreate-db=true`).

## Teardown flags

| Flag                    | Required | Effect                                                    |
| ----------------------- | -------- | --------------------------------------------------------- |
| `--dry-run=true\|false` | yes      | `true`: print plan only                                   |
| `--apply=true\|false`   | yes      | `true`: execute teardown                                  |
| `--drop-db=true\|false` | yes      | `true`: drop `job_tracker_<slug>`; `false`: keep database |
| `--dbeaver=true\|false` | yes      | `true`: remove DBeaver connection                         |
| `[slug]`                | no       | Optional positional slug (else from `.env.worktree`)      |

Exactly one of `--dry-run` or `--apply` must be `true` (the other `false`).

**Apply order:** PM2 delete → DBeaver (if `--dbeaver=true`) → dropdb (if `--drop-db=true`) → port registry → remove `.env.worktree`.

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
