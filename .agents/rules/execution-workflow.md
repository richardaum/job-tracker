# Execution Workflow

Mandatory 3-phase lifecycle for every task.

## 1. Pre-task — load rules

1. Scan AGENTS.md keyword index for terms matching the task
2. Read ALL matching `.agents/rules/*.md` files **before** writing any code
3. Load matching `.agents/skills/*` skill if applicable

## 2. Execute

- Follow patterns from rules loaded in pre-task
- Make minimal, focused changes

## 3. Post-task — verify

Run ALL of the following before marking done:

1. **Validation** — per `validation.md`: `lint`, `typecheck`, `test` for affected apps
2. **PM2 logs** — `pm2 logs <app> --lines 30 --nostream` for every affected app
3. **Docker logs** — `docker logs job-tracker-api 2>&1 | tail -30` if API changed

Confirm zero new errors. If any found, investigate before finishing.

## Rules

- Rule lookup is mandatory before coding — skipping causes missed rules
- Post-task verification is mandatory — skipping causes undetected regressions
- EOC check (ops-docker-pm2.md §EOC task check) applies to every task
- Do NOT mark task complete until post-task passes
