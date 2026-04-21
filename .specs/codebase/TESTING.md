# Testing Strategy

## Tools

| Tool                   | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| Vitest                 | Unit and integration tests (all workspaces)     |
| @testing-library/react | React component testing (packages/ui, apps/web) |
| Playwright             | End-to-end tests (apps/web)                     |
| Storybook Test Runner  | Visual/interaction gate (packages/ui)           |

---

## Test Coverage Matrix

| Layer                  | Workspace   | Type        | Parallel-Safe |
| ---------------------- | ----------- | ----------- | ------------- |
| Services / utils       | apps/api    | unit        | Yes           |
| Guards / interceptors  | apps/api    | unit        | Yes           |
| GraphQL resolvers      | apps/api    | integration | No            |
| Repositories + real DB | apps/api    | integration | No            |
| React components       | packages/ui | unit        | Yes           |
| Storybook stories      | packages/ui | visual      | Yes           |
| Hooks / utils          | apps/web    | unit        | Yes           |
| Full user flows        | apps/web    | e2e         | Yes           |

---

## Coverage Thresholds

| Workspace   | Metric         | Threshold |
| ----------- | -------------- | --------- |
| apps/api    | line coverage  | 80%       |
| apps/web    | line coverage  | 80%       |
| packages/ui | line coverage  | 80%       |
| packages/ui | story coverage | 100%      |

---

## Gate Check Commands

| Gate          | Command                                          | When to use                                                        |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| **lint**      | `pnpm lint`                                      | ESLint (Turbo) — all workspaces; run before commit                 |
| **format**    | `pnpm format:check`                              | Prettier check — matches CI / pre-commit formatting                |
| **repo-ts**   | `pnpm typecheck:repo`                            | `tsc --noEmit` for root `eslint.config.ts` / `prettier.config.mts` |
| **quick**     | `pnpm vitest run` (within workspace)             | Unit tests only — fast feedback during task execution              |
| **full**      | `pnpm turbo test`                                | All unit + integration tests across all workspaces                 |
| **e2e**       | `pnpm --filter @job-tracker/web playwright test` | End-to-end flows — run after full gate passes                      |
| **storybook** | `pnpm --filter @job-tracker/ui test-storybook`   | Visual gate — 100% story coverage enforced                         |
| **build**     | `pnpm turbo build && pnpm turbo typecheck`       | Compilation + type checking — required before deploy               |
| **audit**     | `pnpm audit --audit-level=high`                  | Dependency vulnerability scan — must pass before merging any PR    |

---

## Parallelism Assessment

| Test Type          | Parallel-Safe | Reason                                                           |
| ------------------ | ------------- | ---------------------------------------------------------------- |
| unit               | Yes           | No shared state, no I/O                                          |
| integration        | No            | Shared PostgreSQL instance — concurrent writes cause flaky tests |
| e2e                | Yes           | Playwright manages parallelism internally per worker             |
| visual (Storybook) | Yes           | Static rendering, no shared state                                |

---

## Rules

- Tests are **co-located with tasks** — never deferred to a separate task
- Integration tests run against a **real local PostgreSQL** — no mocks for DB layer
- Every task that creates a code layer must include its required test type in **Done when**
- CI enforces coverage thresholds — builds fail below 80%
- `packages/ui`: story coverage gate is 100% — every exported component must have a story

---

## TLC Evidence Checklist (Before marking done)

For each task, capture this minimum evidence:

- **Artifacts**: list each expected file from `Where` and confirm it exists.
- **Assertions**: map each `Done when` bullet to code or test evidence.
- **Gate output**: run and record the exact gate command result.
- **Preconditions**: record required runtime context (e.g. Storybook server running for `test-storybook`).

If any one item above is missing, the task must remain open.
