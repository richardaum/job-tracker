# Summary: Quick Task 002 — Zod + server-only env validation

**Completed:** 2026-04-19

## Outcome

- **API:** `DATABASE_URL` is validated once when `env/server` loads (URL + `postgresql://` prefix). Nest and Drizzle share the same typed value.
- **Web:** Server env module is ready to grow (`serverEnv` + `ServerEnv` type); `server-only` blocks accidental imports from Client Components during the Next build.
- **Tests:** Integration specs that skip without a database must not statically import modules that eagerly parse env; dynamic import after the `hasDb` gate avoids loading `env/server` in CI without Postgres.

## Verification run

`pnpm --filter @job-tracker/api test` and `pnpm --filter @job-tracker/web build` succeeded after the change set.

## Follow-up

- When adding auth, email, or third-party keys, extend `serverEnvSchema` in each app’s `env/server.ts` (prefix/length checks as appropriate) and export destructured or typed `serverEnv`.
- After any follow-up commit, update **Commit** in `TASK.md` and the Quick Tasks table in `.specs/project/STATE.md` if this task gains additional SHAs.
