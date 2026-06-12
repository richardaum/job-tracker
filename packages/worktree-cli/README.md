# Worktree scripts

CLI helpers to run **api + web + storybook + extension** in a [git worktree](https://git-scm.com/docs/git-worktree) alongside the main checkout. Isolation uses dedicated ports, a cloned PostgreSQL database (`job_tracker_<slug>`), and per-app `.env` files written by the setup script. PM2 namespace and prefix are derived from the directory name.

CLI is built with **yargs**. Boolean flags use `--flag` / `--no-flag` conventions (safe for agents and CI-style automation).

## Prerequisites

- Run from a **linked worktree** checkout (not the main repo root). Both scripts call `assertGitWorktree` and exit on the main checkout.
- Source DB name: `WORKTREE_SOURCE_DB` (typically `job_tracker`).
- Main checkout `apps/api/.env` must exist (secrets are copied from there).
- PostgreSQL reachable locally or via Docker (`docker compose` postgres service, or `WORKTREE_POSTGRES_DOCKER`).

Slug is derived from the worktree directory name (kebab-case, ≤16 chars) or from the current branch when the folder is still named `job-tracker`.

## Commands

From the **worktree root**:

```bash
export WORKTREE_SOURCE_DB=job_tracker

# Setup — dry-run first, then apply
WORKTREE_SOURCE_DB=job_tracker pnpm worktree:setup -- \
  --dry-run \
  --dbeaver \
  --install \
  --migrate \
  --start \
  --verify \
  --open

WORKTREE_SOURCE_DB=job_tracker pnpm worktree:setup -- \
  --no-dry-run \
  --dbeaver \
  --install \
  --migrate \
  --start \
  --verify \
  --open

# Teardown — dry-run first, then apply
pnpm worktree:teardown -- \
  --dry-run

pnpm worktree:teardown -- \
  --apply \
  --dbeaver
```

Direct invocation (repo root as cwd is resolved from script location):

```bash
node --experimental-strip-types packages/worktree-cli/src/setup.ts -- \
  --dry-run --dbeaver

node --experimental-strip-types packages/worktree-cli/src/teardown.ts -- \
  --dry-run
```

## Setup flags

| Flag              | Type    | Default | Effect                                                             |
| ----------------- | ------- | ------- | ------------------------------------------------------------------ |
| `--dry-run`       | boolean | `false` | `true`: print plan only (no writes, no post-steps)                 |
| `--recreate-db`   | boolean | `false` | `true`: drop and re-clone destination DB                           |
| `--dbeaver`       | boolean | `false` | `true`: add DBeaver connection under Job Tracker/Worktrees         |
| `--force-dbeaver` | boolean | `false` | `true`: replace existing DBeaver connection (requires `--dbeaver`) |
| `--install`       | boolean | `false` | `true`: `pnpm install` (after core setup)                          |
| `--migrate`       | boolean | `false` | `true`: `pnpm --filter @job-tracker/api run db:migrate`            |
| `--start`         | boolean | `false` | `true`: `pnpm pm2:start`                                           |
| `--verify`        | boolean | `false` | `true`: curl API/Web/Storybook/WXT (WXT failure is warning only)   |
| `--open`          | boolean | verify  | `true`: open web app in default browser after post-setup           |

**Note:** `WORKTREE_SOURCE_DB` environment variable must be set before setup runs.

**Core setup** (when `--no-dry-run`): clone DB → allocate ports → write per-app `.env` files → optional DBeaver → optional post-steps.

Re-running setup is idempotent: ports reused from `/tmp/job-tracker-ports.json`, DB clone skipped if the database already exists (unless `--recreate-db`).

## Teardown flags

| Flag        | Type    | Default | Effect                                                   |
| ----------- | ------- | ------- | -------------------------------------------------------- |
| `--dry-run` | boolean | `false` | Print plan only                                          |
| `--apply`   | boolean | `false` | Execute teardown                                         |
| `--drop-db` | boolean | `true`  | Drop `job_tracker_<slug>`; `--no-drop-db` keeps database |
| `--dbeaver` | boolean | `false` | Remove DBeaver connection                                |
| `[slug]`    | string  | —       | Optional positional slug (derived from directory name)   |

Exactly one of `--dry-run` or `--apply` must be set (they conflict).

**Apply order:** PM2 delete → DBeaver (if `--dbeaver`) → dropdb (if `--drop-db`) → port registry.

`git worktree remove` is **not** automated — see stderr hint after teardown.

## Environment variables

| Variable                        | Purpose                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `WORKTREE_SOURCE_DB`            | Default `--source-db` for setup                                                  |
| `WORKTREE_POSTGRES_DOCKER`      | Force Postgres container name/id                                                 |
| `WORKTREE_POSTGRES_USER`        | Postgres role (default `postgres`)                                               |
| `WORKTREE_DBEAVER_DATA_SOURCES` | Override `data-sources.json` path (macOS default under `~/Library/DBeaverData/`) |

## Artifacts

| Path                                 | Role                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `apps/api/.env`                      | API: DATABASE_URL, PORT, GOOGLE_CALLBACK_URL, WEB_URL (worktree overrides) |
| `apps/web/.env`                      | Web: PORT, NEXT_PUBLIC_API_URL, E2E_PORT (worktree overrides)              |
| `packages/ui/.env`                   | Storybook: STORYBOOK_PORT (worktree override)                              |
| `apps/extension/.env.development`    | Extension: WXT*DEV_PORT, WXT_PUBLIC*\* (worktree override)                 |
| `/tmp/job-tracker-ports.json`        | Global slug → port map                                                     |
| `/tmp/job-tracker-<slug>.ports.json` | Per-slug port cache (includes PM2_RESET_PORTS for scripts)                 |

Main checkout ports **3100, 3101, 6006, 3001** are reserved and never assigned to worktrees.

## Layout

Package: `@job-tracker/worktree-cli` (`packages/worktree-cli/`).

| File              | Role                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `src/setup.ts`    | Setup orchestrator (yargs CLI)                                        |
| `src/teardown.ts` | Teardown orchestrator (yargs CLI)                                     |
| `src/lib.ts`      | Git guards, ports, DB clone/drop, env, PM2, post-steps                |
| `src/dbeaver.ts`  | Read/write DBeaver `data-sources.json` (passwords not stored in JSON) |
| `derive-slug.cjs` | CommonJS slug helper for `ecosystem.config.cjs` (PM2)                 |
| `src/*.test.ts`   | Unit tests (`pnpm --filter @job-tracker/worktree-cli run test`)       |

Agent rules: `.agents/rules/ops/worktree.md`. Setup/teardown: `@worktree-env` (`.agents/skills/worktree-env/SKILL.md`). Feature execution loop: `@worktree-loop` (`.agents/skills/worktree-loop/SKILL.md`). PM2/ports: `.agents/rules/ops/docker-pm2.md`.
