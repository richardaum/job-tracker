# Docker (API)

Build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`

# PM2

Long-running apps (**`api`**, **`web`**, **`storybook`**, **`extension`**) — start/stop/restart/teardown via PM2 only (**`pnpm pm2:start`** / **`pnpm pm2:stop`** / **`pnpm pm2:restart`**, **`pm2 delete`**, **`pm2 kill`** as needed). Logs: **`~/.pm2/logs/`** (`*-out.log`, `*-error.log`).

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
