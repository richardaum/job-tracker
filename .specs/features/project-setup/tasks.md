# Project Setup — Tasks

**Spec:** `.specs/features/project-setup/spec.md`
**Status:** In Progress

---

## Execution Plan

### Phase 1: Foundation (Sequential)

```
T01
```

### Phase 2: Framework Init (Parallel)

```
T01 ──┬── T02 [P]
      ├── T03 [P]
      └── T04 [P]
```

### Phase 3: Tooling (Parallel)

```
T02 ──┬── T07 [P]
      └── T08 [P]

T03 ──┬── T09 [P]
      └── T10 [P]

T04 ──┬── T05 [P]
      └── T06 [P]
```

### Phase 4: Observability (Parallel)

```
T07 ──── T11 [P]
T09 ──── T12 [P]
```

### Phase 5: CI (Sequential)

```
T05, T06, T07, T08, T09, T10, T11, T12 ──── T13
```

---

## Task Breakdown

### T01: Turborepo config ✅

**What:** Create `turbo.json` with dev, build, test, lint, typecheck pipelines
**Where:** `/turbo.json`
**Depends on:** None
**Requirement:** PS-09

**Done when:**

- [x] `turbo.json` defines pipelines with correct dependencies (`build` depends on `^build`)
- [x] `pnpm turbo build` runs without errors
- [x] `pnpm turbo dev` starts all workspaces in parallel

**Tests:** none
**Gate:** build — `pnpm turbo build`

---

### T02: Next.js 15 init ✅ [P]

**What:** Initialize Next.js 15 in `apps/web` with App Router, TypeScript, and no API routes
**Where:** `apps/web/` — `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
**Depends on:** T01
**Requirement:** PS-02

**Done when:**

- [ ] `next.config.ts` has no API routes or explicit Server Actions
- [ ] `src/app/layout.tsx` with minimal `<html>` and `<body>`
- [ ] `src/app/page.tsx` with placeholder content
- [ ] `pnpm --filter @job-tracker/web build` passes with no TypeScript errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/web build`

---

### T03: NestJS bootstrap ✅ [P]

**What:** Initialize NestJS in `apps/api` with Fastify adapter and a `/health` endpoint
**Where:** `apps/api/src/` — `main.ts`, `app.module.ts`, `app.controller.ts`, `app.controller.spec.ts`, `vitest.config.ts`
**Depends on:** T01
**Requirement:** PS-03

**Done when:**

- [ ] `main.ts` uses `FastifyAdapter` and listens on port 3001
- [ ] `AppController` exposes `GET /health` returning `{ status: 'ok' }`
- [ ] Vitest configured (`vitest.config.ts`) in the workspace
- [ ] `app.controller.spec.ts` asserts `GET /health` returns `{ status: 'ok' }`
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 1 test passes

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T04: Tailwind CSS v4 + Radix UI base ✅ [P]

**What:** Configure Tailwind CSS v4 and Radix UI as the design system foundation in `packages/ui`
**Where:** `packages/ui/` — `tailwind.config.ts`, `src/globals.css`
**Depends on:** T01
**Requirement:** PS-04

**Done when:**

- [ ] Tailwind CSS v4 installed and configured in `packages/ui`
- [ ] Radix UI primitives installed
- [ ] `src/globals.css` includes Tailwind directives
- [ ] `pnpm --filter @job-tracker/ui build` passes with no errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/ui build`

---

### T05: Storybook setup + first story ✅ [P]

**What:** Configure Storybook in `packages/ui` and create first story (Button placeholder)
**Where:** `packages/ui/.storybook/`, `packages/ui/src/components/Button/Button.stories.tsx`
**Depends on:** T04
**Requirement:** PS-04

**Done when:**

- [ ] `.storybook/main.ts` and `.storybook/preview.ts` configured with Tailwind
- [ ] `Button` placeholder component created with a `Default` story
- [ ] `pnpm --filter @job-tracker/ui storybook build` compiles without errors
- [ ] Gate: `pnpm --filter @job-tracker/ui test-storybook` — 1 story passes

**Tests:** visual
**Gate:** storybook — `pnpm --filter @job-tracker/ui test-storybook`

---

### T06: Vitest setup + first unit test (packages/ui) ✅ [P]

**What:** Configure Vitest with `@testing-library/react` in `packages/ui` and write first unit test
**Where:** `packages/ui/vitest.config.ts`, `packages/ui/src/components/Button/Button.test.tsx`
**Depends on:** T04
**Requirement:** PS-04

**Done when:**

- [ ] `vitest.config.ts` uses `jsdom` environment with `@testing-library/react`
- [ ] `Button.test.tsx` asserts the component renders without crashing
- [ ] Gate: `pnpm --filter @job-tracker/ui vitest run` — 1 test passes

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/ui vitest run`

---

### T07: Vitest setup + first unit test (apps/web) ✅ [P]

**What:** Configure Vitest in `apps/web` and write first unit test (home page renders)
**Where:** `apps/web/vitest.config.ts`, `apps/web/src/app/page.test.tsx`
**Depends on:** T02
**Requirement:** PS-02

**Done when:**

- [ ] `vitest.config.ts` uses `jsdom` with Next.js aliases resolved
- [ ] `page.test.tsx` asserts the home page renders without crashing
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1 test passes

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

### T08: Playwright setup + smoke test ✅ [P]

**What:** Configure Playwright in `apps/web` and write a smoke test (homepage loads)
**Where:** `apps/web/playwright.config.ts`, `apps/web/e2e/home.spec.ts`
**Depends on:** T02
**Requirement:** PS-02

**Done when:**

- [ ] `playwright.config.ts` targets `http://localhost:3000`
- [ ] `home.spec.ts` asserts the homepage returns HTTP 200
- [ ] Gate: `pnpm --filter @job-tracker/web exec playwright test` — 1 test passes (requires `next dev`)

**Tests:** e2e
**Gate:** e2e — `pnpm --filter @job-tracker/web exec playwright test`

---

### T09: Drizzle ORM + PostgreSQL connection ✅ [P]

**What:** Configure Drizzle ORM in `apps/api` with a PostgreSQL connection and write an integration test
**Where:** `apps/api/src/database/` — `drizzle.config.ts`, `database.module.ts`, `database.service.ts`, `database.service.spec.ts`
**Depends on:** T03
**Requirement:** PS-05

**Done when:**

- [ ] `drizzle.config.ts` reads `DATABASE_URL` from env
- [ ] `DatabaseService` exposes the Drizzle instance as a NestJS provider
- [ ] `database.service.spec.ts` verifies the connection with `db.execute(sql'SELECT 1')` against real DB
- [ ] `drizzle-kit generate` and `drizzle-kit migrate` run without errors
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — integration tests pass (requires local PostgreSQL)

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T10: Docker setup (Dockerfile + docker-compose) ⚠️ [P]

**What:** Create a production `Dockerfile` for `apps/api` and a `docker-compose.yml` for local PostgreSQL
**Where:** `apps/api/Dockerfile`, `docker-compose.yml` (root)
**Depends on:** T03
**Requirement:** PS-06

**Done when:**

- [ ] `Dockerfile` is multi-stage: build → production, final image excludes devDependencies
- [ ] `docker-compose.yml` starts PostgreSQL on port 5432 with env vars
- [ ] `docker build -t job-tracker-api ./apps/api` passes without errors

**Tests:** none
**Gate:** build — `docker build -t job-tracker-api ./apps/api`

---

### T11: Sentry setup (apps/web) [P]

**What:** Configure Sentry in Next.js 15 via `@sentry/nextjs`
**Where:** `apps/web/sentry.client.config.ts`, `apps/web/sentry.server.config.ts`, `apps/web/instrumentation.ts`
**Depends on:** T07
**Requirement:** PS-08

**Done when:**

- [ ] `@sentry/nextjs` installed and `withSentryConfig` applied in `next.config.ts`
- [ ] DSN read from `NEXT_PUBLIC_SENTRY_DSN` env var
- [ ] `pnpm --filter @job-tracker/web build` passes without errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/web build`

---

### T12: Sentry setup (apps/api) [P]

**What:** Configure Sentry in NestJS via `@sentry/node`
**Where:** `apps/api/src/main.ts` (Sentry.init before NestJS factory)
**Depends on:** T09
**Requirement:** PS-08

**Done when:**

- [ ] `@sentry/node` installed and `Sentry.init()` called at the top of `main.ts`
- [ ] DSN read from `SENTRY_DSN` env var
- [ ] `pnpm --filter @job-tracker/api build` passes without errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/api build`

---

### T13: GitHub Actions CI pipeline

**What:** Create a CI workflow running lint → typecheck → test → build for all workspaces
**Where:** `.github/workflows/ci.yml`
**Depends on:** T05, T06, T07, T08, T09, T10, T11, T12
**Requirement:** PS-07

**Done when:**

- [ ] Workflow triggers on `push` and `pull_request` to `main`
- [ ] Steps: install → lint → typecheck → test → build (via `turbo`)
- [ ] PostgreSQL service container configured for integration tests
- [ ] 80% line coverage threshold enforced via Vitest reporter

**Tests:** none
**Gate:** N/A (validated via GitHub after push)

---

## Parallel Execution Map

```
Phase 1:  T01

Phase 2:  T01 ──┬── T02 [P]
                ├── T03 [P]
                └── T04 [P]

Phase 3:  T02 ──┬── T07 [P]
                └── T08 [P]
          T03 ──┬── T09 [P]
                └── T10 [P]
          T04 ──┬── T05 [P]
                └── T06 [P]

Phase 4:  T07 ──── T11 [P]
          T09 ──── T12 [P]

Phase 5:  T05,T06,T07,T08,T09,T10,T11,T12 ──── T13
```

---

## Granularity Check

| Task                                            | Scope                                      | Status |
| ----------------------------------------------- | ------------------------------------------ | ------ |
| T01: turbo.json                                 | 1 config file                              | ✅     |
| T02: Next.js init                               | 3 files (config + layout + page)           | ✅     |
| T03: NestJS bootstrap + Vitest + unit test      | 5 files, cohesive (bootstrap + test infra) | ✅     |
| T04: Tailwind + Radix config                    | 2 config files                             | ✅     |
| T05: Storybook + first story                    | 3 files (.storybook × 2 + story)           | ✅     |
| T06: Vitest + first test (ui)                   | 2 files                                    | ✅     |
| T07: Vitest + first test (web)                  | 2 files                                    | ✅     |
| T08: Playwright + smoke test                    | 2 files                                    | ✅     |
| T09: Drizzle + DB connection + integration test | 4 files, cohesive (infra + test)           | ✅     |
| T10: Dockerfile + docker-compose                | 2 files                                    | ✅     |
| T11: Sentry web                                 | 3 files                                    | ✅     |
| T12: Sentry api                                 | 1 file edit                                | ✅     |
| T13: GitHub Actions                             | 1 YAML file                                | ✅     |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body)               | Diagram Shows | Status |
| ---- | ------------------------------- | ------------- | ------ |
| T01  | None                            | start         | ✅     |
| T02  | T01                             | T01 → T02     | ✅     |
| T03  | T01                             | T01 → T03     | ✅     |
| T04  | T01                             | T01 → T04     | ✅     |
| T05  | T04                             | T04 → T05     | ✅     |
| T06  | T04                             | T04 → T06     | ✅     |
| T07  | T02                             | T02 → T07     | ✅     |
| T08  | T02                             | T02 → T08     | ✅     |
| T09  | T03                             | T03 → T09     | ✅     |
| T10  | T03                             | T03 → T10     | ✅     |
| T11  | T07                             | T07 → T11     | ✅     |
| T12  | T09                             | T09 → T12     | ✅     |
| T13  | T05,T06,T07,T08,T09,T10,T11,T12 | all → T13     | ✅     |

---

## Test Co-location Validation

| Task | Layer Created              | Matrix Requires | Task Says   | Status |
| ---- | -------------------------- | --------------- | ----------- | ------ |
| T01  | config                     | none            | none        | ✅     |
| T02  | Next.js pages              | none            | none        | ✅     |
| T03  | Service / Controller (api) | unit            | unit        | ✅     |
| T04  | config                     | none            | none        | ✅     |
| T05  | Storybook story            | visual          | visual      | ✅     |
| T06  | React component (ui)       | unit            | unit        | ✅     |
| T07  | Hook / util (web)          | unit            | unit        | ✅     |
| T08  | Full user flow             | e2e             | e2e         | ✅     |
| T09  | Repository + real DB       | integration     | integration | ✅     |
| T10  | Docker config              | none            | none        | ✅     |
| T11  | config                     | none            | none        | ✅     |
| T12  | config                     | none            | none        | ✅     |
| T13  | CI config                  | none            | none        | ✅     |
