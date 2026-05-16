# AGENTS.md — Job Tracker

## Reply modes (`[v]` / `[s]`)

**`[v]`** or **`[s]`** anywhere in the prompt sets mode: **`[v]`** = verbose (extra reasoning, edges, trade-offs, on-topic context); **`[s]`** = short (minimal prose; skip optional background unless needed for correctness). If both appear, **last** wins.

## Monorepo

Turbo + pnpm workspace: `apps/web` (Next.js 16), `apps/api` (NestJS 11 + GraphQL), `apps/extension` (Chrome MV3 / WXT), `packages/ui`, `packages/logger`.

## Toolchain

Node 22+, pnpm 10.8+.

## Root `package.json` scripts

`dev`, `build`, `test`, `lint`, `typecheck`, `ci:local`, `e2e`, `fix:imports`, `test:scripts`, `leanspec:validate`, `leanspec:sync-spec-indices` (canonical list in root `package.json`).

## Subagents & Parallelism

When supported by the agent, high-volume tasks like `lint`, `test`, and `typecheck` (tsc) can be executed separately and in parallel using subagents to optimize context usage and speed up validation.

## LeanSpec (`specs/`)

Canonical reference: **`docs/CONVENTIONS.mdx`** → LeanSpec. Validate: `pnpm leanspec:validate`.

Numbered folders (`specs/<NNN-slug>/`), primary `README.md` per spec. Indices: `pnpm leanspec:sync-spec-indices` after creating/editing specs or traceability IDs (`[P-NNN]`, `[T-NNN]`, `[R-NNN]`, `[H-NNN]`). CI runs `--check` on `specs/INDEX.md` — keep it regenerated, not hand-edited.

| Keyword / trigger            | Convention section / doc                    |
| ---------------------------- | ------------------------------------------- |
| `LeanSpec`, `specs/`         | `docs/CONVENTIONS.mdx` → LeanSpec           |
| `[P-NNN]`, `[T-NNN]`         | LeanSpec → Traceability IDs                 |
| `spec indices`, `sync-spec`  | LeanSpec → Spec indices                     |
| `HISTORY.md`, `docs-history` | LeanSpec → Workflow                         |
| `leanspec:validate`          | Root `package.json` scripts + Quality gates |

## Packages

| Path               | Domain                                                  |
| ------------------ | ------------------------------------------------------- |
| `apps/api`         | NestJS 11, GraphQL, TypeORM, PostgreSQL, Docker         |
| `apps/web`         | Next.js 16, Apollo Client, view-models, generated hooks |
| `apps/extension`   | WXT + Vite + React, Chrome MV3                          |
| `packages/ui`      | Radix + Tailwind, Storybook                             |
| `packages/logger`  | Typed logger                                            |
| `packages/try-run` | `tryRun` utility                                        |

## Tests

Per-package configs in respective `apps/*/AGENTS.md` and `packages/*/AGENTS.md`.

- **E2E**: Playwright in `apps/web/e2e/`, Chromium; web server on `E2E_PORT` (default 3100).

## GraphQL codegen

`apps/web/codegen.ts` reads `apps/api/src/schema.gql`, writes `apps/web/src/gql/`; post-process `scripts/postprocess-codegen-hooks.mjs`.

## Import sorting (`fix:imports`)

`scripts/fix-imports.ts` — lightweight ESLint wrapper that loads **only** `simple-import-sort` (no type-checking, no React/Next/Tailwind plugins). Roughly 10× faster than full `lint:fix`.

Usage: `pnpm fix:imports "apps/web/src/**/*.{ts,tsx}"`

Runs **before** `eslint --fix` in pre-commit lint-staged, so `eslint --fix` doesn't also have to sort imports. Test: `pnpm test:scripts`.

## ESLint

`className` via `cn()` only; no raw `process.env` in `apps/web/src/` — use `src/env/`; in config/codegen only: `CI`, `E2E_PORT`, `API_GRAPHQL_URL`, `NODE_ENV`. Package `lint` scripts and pre-commit lint-staged use **`node --experimental-strip-types scripts/fix-imports.ts`** then **`eslint --fix --max-warnings=0 --no-warn-ignored`** (then `tsc --noEmit` where applicable); fix anything **not** autofixable before push. Prefer **`pnpm fix:imports`** → **`pnpm lint`** / **`eslint --fix`** / **`prettier --write`** on affected paths before hand-editing many lines (see **Quality gates** in **`docs/CONVENTIONS.mdx`**).

## Turbo

`test` and `typecheck` depend on `^build`; `dev` persistent (no cache).

## Docker (API)

Build from repo root: `docker build -f apps/api/Dockerfile -t job-tracker-api:local .`

## Database migrations

`apps/api/src/database/`.

## PM2

Long-running apps (**`api`**, **`web`**, **`storybook`**, **`extension`**) — start/stop/restart/teardown via PM2 only (**`pnpm pm2:start`** / **`pnpm pm2:stop`** / **`pnpm pm2:restart`**, **`pm2 delete`**, **`pm2 kill`** as needed). Logs: **`~/.pm2/logs/`** (`*-out.log`, `*-error.log`).

## Dead Code

Before finishing a task, run a dead code check against affected packages (`pnpm knip` or `npx knip`). If dead code (unused exports, files, dependencies) is found, list each item and **ask the user whether to remove it** — do not delete without confirmation.

## CI

GitHub Actions: `ci` (Postgres 16-alpine, Node 22, pnpm 10.8.1), `e2e`, `docker-api`. CI installs with `pnpm install --frozen-lockfile`. CI fails if lint leaves a dirty tree.

## Conventions

Code and Storybook: consulting and following **`docs/CONVENTIONS.mdx`** is **mandatory** (Storybook -> Documentation -> Conventions). For every task, you must also proactively search for relevant keywords related to the work being performed to ensure full adherence to the project guides.

### Keyword index

Search the keyword in `docs/CONVENTIONS.mdx` (unless another doc is listed). Matches are by **section topic**, not exhaustive grep.

| Keyword / trigger                                        | Convention section / doc                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| `asChild`, `Slot`, `NextLink`, hydration                 | UI: composition, layout, and components → Composition and hydration   |
| `forwardRef`, `useMemo`, `useCallback`                   | React 19 and React Compiler                                           |
| `view-model`, `useXxxViewModel`, `useQuery`              | Web view models + GraphQL client (`apps/web`)                         |
| `tryRun`, `try/catch`                                    | TypeScript and React → Async errors                                   |
| `import type`, inline `import("@/path")`                 | TypeScript and React → Imports                                        |
| `reexports`, barrel files                                | TypeScript and React → Reexports                                      |
| `Nova`, helper function placement                        | TypeScript and React → Nova convention                                |
| `cn()`, `className`                                      | ESLint                                                                |
| `process.env`                                            | ESLint + Repository architecture → Environment                        |
| `ConfirmDialog`, `window.confirm`, `alert`               | Dialogs and confirmations                                             |
| `FieldWithLabelAction`, tooltip in field                 | FieldWithLabelAction Tooltips                                         |
| `TipTap`, editor, `autofocus`                            | Editors (TipTap)                                                      |
| `button`, `state`, `loading` prop                        | Buttons                                                               |
| `delete`, `removeDeletedEntityFromListCache`             | GraphQL list consistency + Delete mutations payload standard          |
| `card`, `Stack`, list layout, `ApplicationCard`          | List and detail page layout → List (index)                            |
| `detail page`, `Tabs`, side column, grid layout          | List and detail page layout → Detail (item)                           |
| `useControllableState`                                   | Web application patterns → Controllable state                         |
| `extraction`, `SRP`, `M.O.`                              | New implementation extraction M.O.                                    |
| `NestJS`, `AuthModule`, `@UseGuards`                     | NestJS modules and guards                                             |
| `fieldMetadata`, `summaryMetadata`, `generationMetadata` | Repository architecture → Async task JSONB metadata (`fieldMetadata`) |
| `migration`, `TypeORM`, schema change                    | Database migrations + `apps/api/src/database/`                        |
| `GraphQL`, `schema.gql`, codegen, `registerEnum`         | GraphQL codegen + Agent skill: `job-tracker-api`                      |
| `enum`, `@Field`, TypeGraphQL enum                       | `docs/CONVENTIONS.mdx` + Agent skill: `job-tracker-api`               |
| `storybook`, `packages/ui`                               | Quality gates + `packages/ui/.storybook/`                             |
| `skill`, `.ai/skills`, agent skill                       | Agent skill: `job-tracker-api` (CONVENTIONS.mdx)                      |
| `fix:imports`, import sorting                            | Import sorting (`fix:imports`)                                        |
| `knip`, dead code                                        | Dead Code                                                             |
| `PM2`, `pm2:start`, `pm2:stop`                           | PM2                                                                   |
| `Docker`, `docker build`                                 | Docker (API)                                                          |
| `e2e`, Playwright                                        | Tests                                                                 |
| `CI`, GitHub Actions, lint dirty tree                    | CI                                                                    |
| `mobile debug`, ngrok, `__debug_ingest`                  | Development: mobile debug (Cursor)                                    |
| `uppercase`, `*.mdx` / `*.md` naming                     | Documentation MDX → Uppercase stems                                   |
| `--before` in headings                                   | Documentation MDX → No `---` before headings                          |
| `instructions`, `opencode.json` glob patterns            | `docs/CONVENTIONS.mdx` + OpenCode docs → Rules & Config               |
