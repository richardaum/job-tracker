# AGENTS.md — Job Tracker

## Monorepo

Turbo + pnpm workspace. Node 22+, pnpm 10.8+.

| Path               | Domain                                                  |
| ------------------ | ------------------------------------------------------- |
| `apps/api`         | NestJS 11, GraphQL, TypeORM, PostgreSQL, Docker         |
| `apps/web`         | Next.js 16, Apollo Client, view-models, generated hooks |
| `apps/extension`   | WXT + Vite + React, Chrome MV3                          |
| `packages/ui`      | Radix + Tailwind, Storybook                             |
| `packages/logger`  | Typed logger                                            |
| `packages/try-run` | `tryRun` utility                                        |

Scripts: see `scripts` in root `package.json`.

Turbo: `test` and `typecheck` depend on `^build`; `dev` persistent (no cache).

## LeanSpec (`specs/`)

Canonical reference: **`.agents/rules/leanspec.md`**.

## Domain rules

Domain-specific rules modularized in `.agents/rules/`:

| File                         | Domain                                                           |
| ---------------------------- | ---------------------------------------------------------------- |
| `docs-conventions.md`        | MDX format, naming, language rules                               |
| `execution-workflow.md`      | Task lifecycle, rule lookup, post-task verification              |
| `graphql-web.md`             | Codegen, view-models, list cache consistency                     |
| `leanspec.md`                | LeanSpec structure, IDs, workflow                                |
| `ops-docker-pm2.md`          | Docker build, PM2 lifecycle, error logs                          |
| `repository-architecture.md` | App boundaries, NestJS, JSONB metadata, imports, env, migrations |
| `typescript-react.md`        | TypeScript, React 19/Compiler, Nova, imports                     |
| `validation.md`              | Lint, typecheck, tests, CI, fix:imports, dead code, pre-commit   |
| `enum-patterns.md`           | Enum naming, creation, migrations, datafix scripts, case-safety  |
| `worktree.md`                | Worktrees, subagent execution pipeline, reintegration            |
| `web-ui.md`                  | Components, layout, patterns, mobile debug                       |

### Keyword index

Search the keyword in `.agents/rules/` files. Matches are by section topic, not exhaustive grep.

| Keyword / trigger                                                                                                                                                                                                     | Rule file                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `EOC`, `post-task`, `pre-task`, `verify`                                                                                                                                                                              | `execution-workflow.md`                                                                   |
| `asChild`, `Slot`, `NextLink`, hydration                                                                                                                                                                              | `web-ui.md`                                                                               |
| `forwardRef`, `useMemo`, `useCallback`                                                                                                                                                                                | `typescript-react.md`                                                                     |
| `view-model`, `useXxxViewModel`, `useQuery`                                                                                                                                                                           | `graphql-web.md`                                                                          |
| `tryRun`, `try/catch`                                                                                                                                                                                                 | `typescript-react.md`                                                                     |
| `type assertion`, `as`, `cast`, `casting`                                                                                                                                                                             | `typescript-react.md`                                                                     |
| `import type`, inline `import("@/path")`                                                                                                                                                                              | `typescript-react.md`                                                                     |
| `reexports`, barrel files                                                                                                                                                                                             | `typescript-react.md`                                                                     |
| `Nova`, helper function placement                                                                                                                                                                                     | `typescript-react.md`                                                                     |
| `cn()`, `className`                                                                                                                                                                                                   | `typescript-react.md`                                                                     |
| `process.env`                                                                                                                                                                                                         | `repository-architecture.md`                                                              |
| `ConfirmDialog`, `window.confirm`, `alert`                                                                                                                                                                            | `web-ui.md`                                                                               |
| `FieldWithLabelAction`, tooltip in field                                                                                                                                                                              | `web-ui.md`                                                                               |
| `TipTap`, editor, `autofocus`                                                                                                                                                                                         | `web-ui.md`                                                                               |
| `button`, `state`, `loading` prop                                                                                                                                                                                     | `web-ui.md`                                                                               |
| `delete`, `removeDeletedEntityFromListCache`                                                                                                                                                                          | `graphql-web.md`                                                                          |
| `card`, `Stack`, list layout, `ApplicationCard`                                                                                                                                                                       | `web-ui.md`                                                                               |
| `detail page`, `Tabs`, side column, grid layout                                                                                                                                                                       | `web-ui.md`                                                                               |
| `useControllableState`                                                                                                                                                                                                | `web-ui.md`                                                                               |
| `extraction`, `SRP`, `M.O.`                                                                                                                                                                                           | `web-ui.md`                                                                               |
| `NestJS`, `AuthModule`, `@UseGuards`                                                                                                                                                                                  | `repository-architecture.md`                                                              |
| `fieldMetadata`, `summaryMetadata`, `generationMetadata`                                                                                                                                                              | `repository-architecture.md`                                                              |
| `migration`, `TypeORM`, schema change                                                                                                                                                                                 | `repository-architecture.md`                                                              |
| `GraphQL`, `schema.gql`, codegen, `registerEnum`                                                                                                                                                                      | `graphql-web.md`                                                                          |
| `enum`, `@Field`, TypeGraphQL enum                                                                                                                                                                                    | `graphql-web.md`                                                                          |
| `enum creation`, `datafix`, `JSONB enum`, `migration enum`                                                                                                                                                            | `enum-patterns.md`                                                                        |
| `storybook`, `packages/ui`                                                                                                                                                                                            | `validation.md`                                                                           |
| `task lifecycle`, `workflow`, `execution workflow`, `rule lookup`                                                                                                                                                     | `execution-workflow.md`                                                                   |
| `skill`, `.agents/skills`, agent skill                                                                                                                                                                                | `graphql-web.md`                                                                          |
| `lint`, `fix:imports`, `typecheck`, `format`, `test`, `e2e`, CI, knip, dead code                                                                                                                                      | `validation.md`                                                                           |
| `PM2`, `pm2:start`, `pm2:stop`                                                                                                                                                                                        | `ops-docker-pm2.md`                                                                       |
| `Docker`, `docker build`                                                                                                                                                                                              | `ops-docker-pm2.md`                                                                       |
| `worktree`, `git worktree`, `@worktree-env`, `@worktree-loop`, `worktree-loop`, `worktree-cli`, `packages/worktree-cli`, `subagent`, `2 passes`, `reintegrate`, `follow-up work`, `opencode`, `cursor`, `claude code` | `worktree.md`, `worktree-env` / `worktree-loop` skills, `packages/worktree-cli/README.md` |
| `mobile debug`, ngrok, `__debug_ingest`                                                                                                                                                                               | `web-ui.md`                                                                               |
| `uppercase`, `*.mdx` / `*.md` naming                                                                                                                                                                                  | `docs-conventions.md`                                                                     |
| `--before` in headings                                                                                                                                                                                                | `docs-conventions.md`                                                                     |
