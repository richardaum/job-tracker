# Docker (API)

Build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`

# PM2

Long-running apps (**`api`**, **`web`**, **`storybook`**, **`extension`**) — start/stop/restart/teardown via PM2 only (**`pnpm pm2:start`** / **`pnpm pm2:stop`** / **`pnpm pm2:restart`**, **`pm2 delete`**, **`pm2 kill`** as needed). Logs: **`~/.pm2/logs/`** (`*-out.log`, `*-error.log`).

## Main checkout (default)

- Default ports: API **3101**, web **3100**, Storybook **6006**, WXT dev **3001**.
- `pnpm pm2:reset` / `pnpm ports:kill` default kill list: `3100,3101,6006` (extension port not included on main reset).

## Git worktree parallel dev

- Setup **only** inside a linked worktree: **`pnpm worktree:setup`** (requires **`WORKTREE_SOURCE_DB`**). Refuses the main checkout.
- Writes gitignored **`.env.worktree`** at repo root; **`ecosystem.config.cjs`** loads it (namespace `job-tracker-<slug>`, app names `<slug>-api`, …).
- Port registry: **`/tmp/job-tracker-ports.json`** + **`/tmp/job-tracker-<slug>.ports.json`** (reconciled with `lsof`).
- PostgreSQL: shared server `:5432`, database **`job_tracker_<slug>`** cloned from source DB.
- Auth: **`AUTH_BYPASS_ENABLED=true`** in worktree env — no new OAuth redirect URIs.
- Teardown: **`pnpm worktree:teardown`** — all boolean flags use `=true|false`; **`--drop-db=false`** preserves the clone DB.
- **Do not** run `pnpm pm2:reset` or `pnpm ports:kill` in a worktree without **`PM2_RESET_PORTS`** from `.env.worktree` — script refuses default kills to protect other checkouts.
- Logs: `pm2 logs <slug>-api` (and `-web`, `-storybook`, `-extension`).

## EOC task check

At the end of every task, check error logs of affected apps:
- `pm2 logs <app> --lines 30 --nostream` (apps: api, web, extension, storybook)
- `docker logs job-tracker-api 2>&1 | tail -30`
- Confirm no new errors introduced; if found, investigate before finishing.

## PM2 logs (local)
- Logs: `~/.pm2/logs/` — `api-error.log`, `web-error.log`, `extension-error.log`
- Commands: `pm2 logs <app> --lines 50 --nostream` (apps: api, web, extension, storybook)
- Grep: `ERROR`, `QueryFailedError`, `UnhandledPromiseRejection`, `crash`

## Docker logs (API)
- `docker logs job-tracker-api 2>&1 | grep -i error`
- Container logs: `docker compose logs api`
