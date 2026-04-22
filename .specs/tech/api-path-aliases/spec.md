# Monorepo Path Aliases Specification

## Problem Statement

Files in `apps/api/src` use relative parent imports (`../`, `../../`) when crossing directory boundaries. These are fragile — they break silently on file moves and obscure the module's real location. The fix needs to be applied consistently across all workspaces so developers have one predictable convention everywhere. Same-directory imports (`./`) are fine and not affected.

## Goals

- [ ] Establish a consistent path alias convention across all workspaces (`apps/api`, `apps/web`, `packages/ui`)
- [ ] Eliminate all existing relative parent imports from `apps/api/src` (the only workspace with current violations)
- [ ] Ensure alias resolution works in every execution context per workspace (build, dev, test)

## Alias Convention

| Workspace     | Alias    | Maps to                        |
| ------------- | -------- | ------------------------------ |
| `apps/api`    | `@api/*` | `./src/*`                      |
| `apps/web`    | `@/*`    | `./src/*` (already configured) |
| `packages/ui` | `@ui/*`  | `./src/*`                      |

## Out of Scope

| Feature                       | Reason                                            |
| ----------------------------- | ------------------------------------------------- |
| Same-directory imports (`./`) | Not a problem — no parent traversal               |
| Enforcing via ESLint rule     | Nice-to-have, deferred                            |
| Cross-workspace imports       | Handled by package.json exports, not path aliases |

---

## User Stories

### P1: `apps/api` — TypeScript alias `@api/*` configured ⭐ MVP

**User Story**: As a developer, I want to import cross-directory modules in `apps/api` via `@api/*` so that imports are stable regardless of file depth.

**Why P1**: Required foundation — nothing else works without this.

**Acceptance Criteria**:

1. WHEN `apps/api/tsconfig.json` is read THEN it SHALL contain `baseUrl: "."` and `paths: { "@api/*": ["./src/*"] }`
2. WHEN `tsc --noEmit` runs THEN it SHALL pass with zero errors
3. WHEN a file imports `@api/env/server` THEN TypeScript SHALL resolve it to `src/env/server.ts`

**Independent Test**: Run `pnpm typecheck` from `apps/api` — must pass.

---

### P1: `apps/api` — Alias resolved at runtime (NestJS) ⭐ MVP

**User Story**: As a developer, I want `node dist/main` to resolve `@api/*` imports so that the compiled app starts without module-not-found errors.

**Why P1**: Without runtime resolution the app crashes on startup.

**Acceptance Criteria**:

1. WHEN `nest build` compiles the project THEN the output `dist/` SHALL have all `@api/*` references replaced with correct relative paths (via `tsc-alias` post-build step)
2. WHEN `node dist/main` starts THEN it SHALL NOT throw `MODULE_NOT_FOUND` for any `@api/*` import
3. WHEN `nest start --watch` starts in dev mode THEN it SHALL resolve `@api/*` at runtime via `tsconfig-paths/register`

**Independent Test**: Run `pnpm build && node dist/main` — server starts and responds.

---

### P1: `apps/api` — Alias resolved in Vitest ⭐ MVP

**User Story**: As a developer, I want API tests to resolve `@api/*` imports so that `pnpm test` passes.

**Why P1**: Broken test resolution blocks CI.

**Acceptance Criteria**:

1. WHEN `apps/api/vitest.config.ts` is read THEN it SHALL contain a `resolve.alias` mapping `@api/` to the absolute path of `src/`
2. WHEN `pnpm test` runs THEN all specs SHALL resolve imports correctly

**Independent Test**: Run `pnpm test` from `apps/api` — all tests pass.

---

### P1: `apps/api` — All existing parent imports migrated ⭐ MVP

**User Story**: As a developer, I want every existing `../` and `../../` import in `apps/api/src` replaced with `@api/*` so the codebase is consistent.

**Why P1**: Mixed style defeats the purpose.

**Acceptance Criteria**:

1. WHEN the codebase is scanned THEN there SHALL be zero imports matching `from ["']\.\.` in `apps/api/src/**/*.ts`
2. WHEN each migrated file is compiled THEN TypeScript SHALL resolve all imports without error

**Independent Test**: `grep -rn 'from "\.\.' apps/api/src` returns no results.

---

### P1: `packages/ui` — TypeScript alias `@ui/*` configured ⭐ MVP

**User Story**: As a developer, I want to import cross-directory modules in `packages/ui` via `@ui/*` so that the convention is consistent with other workspaces.

**Why P1**: No current violations, but the alias must exist before new code is written so the convention is never broken.

**Acceptance Criteria**:

1. WHEN `packages/ui/tsconfig.json` is read THEN it SHALL contain `baseUrl: "."` and `paths: { "@ui/*": ["./src/*"] }`
2. WHEN `packages/ui/vitest.config.ts` is read THEN it SHALL contain a `resolve.alias` mapping `@ui/` to `src/`
3. WHEN `tsc --noEmit` runs THEN it SHALL pass with zero errors

**Independent Test**: Run `pnpm typecheck` from `packages/ui` — must pass.

---

### P2: `apps/web` — Alias `@/*` documented as already configured

**User Story**: As a developer, I want to know that `apps/web` follows the same convention so I don't wonder about it.

**Why P2**: `apps/web` already has `@/*` configured in both `tsconfig.json` and `vitest.config.ts` (Next.js standard). No changes needed — just awareness.

**Acceptance Criteria**:

1. WHEN `apps/web/tsconfig.json` is read THEN it SHALL have `paths: { "@/*": ["./src/*"] }` (already present — no change)
2. WHEN `apps/web/vitest.config.ts` is read THEN it SHALL have `resolve.alias: { "@": ... }` (already present — no change)

**Independent Test**: Run `pnpm typecheck` and `pnpm test` from `apps/web` — must pass (regression check only).

---

## Affected Files — `apps/api` (current parent imports)

| File                                              | Current import                                   | Replacement                                     |
| ------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `src/database/database.service.ts`                | `../env/server`                                  | `@api/env/server`                               |
| `src/database/schema/index.ts`                    | `../../domains/users/users.schema`               | `@api/domains/users/users.schema`               |
| `src/database/schema/index.ts`                    | `../../domains/applications/applications.schema` | `@api/domains/applications/applications.schema` |
| `src/domains/auth/auth.controller.ts`             | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/auth.controller.ts`             | `../../env/server`                               | `@api/env/server`                               |
| `src/domains/auth/auth.controller.spec.ts`        | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/auth/auth.controller.spec.ts`        | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/auth.controller.spec.ts`        | `../../env/server`                               | `@api/env/server`                               |
| `src/domains/auth/auth.module.ts`                 | `../users/users.module`                          | `@api/domains/users/users.module`               |
| `src/domains/auth/auth.resolver.ts`               | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/auth/auth.resolver.ts`               | `../users/user.type`                             | `@api/domains/users/user.type`                  |
| `src/domains/auth/auth.resolver.spec.ts`          | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/auth/auth.resolver.spec.ts`          | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/auth.service.ts`                | `../../env/server`                               | `@api/env/server`                               |
| `src/domains/auth/auth.service.ts`                | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/auth.service.spec.ts`           | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/google.strategy.ts`             | `../../env/server`                               | `@api/env/server`                               |
| `src/domains/auth/google.strategy.ts`             | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/auth/google.strategy.ts`             | `../users/users.schema`                          | `@api/domains/users/users.schema`               |
| `src/domains/auth/jwt.strategy.ts`                | `../../env/server`                               | `@api/env/server`                               |
| `src/domains/auth/roles.guard.ts`                 | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/auth/roles.guard.spec.ts`            | `../users/users.service`                         | `@api/domains/users/users.service`              |
| `src/domains/users/users.module.ts`               | `../../database/database.module`                 | `@api/database/database.module`                 |
| `src/domains/users/users.repository.ts`           | `../../database/database.service`                | `@api/database/database.service`                |
| `src/domains/users/users.repository.spec.ts`      | `../../database/database.service`                | `@api/database/database.service`                |
| `src/domains/applications/applications.schema.ts` | `../users/users.schema`                          | `@api/domains/users/users.schema`               |

---

## Edge Cases

- WHEN `drizzle.config.ts` (at `apps/api/`) imports from `src/` THEN it SHALL use `./src/...` (it sits outside `src/`, alias not needed)
- WHEN `nest start --watch` restarts on file change THEN `tsconfig-paths` SHALL remain registered
- WHEN a new file is added to any workspace THEN the developer SHALL use the workspace alias for any cross-directory import

---

## Implementation Plan

### `apps/api` (config changes already partially done)

1. ~~**`tsconfig.json`** — add `baseUrl: "."` and `paths: { "@api/*": ["./src/*"] }`~~ ✅ Done
2. ~~**`vitest.config.ts`** — add `resolve.alias: { "@api/": ... }`~~ ✅ Done
3. **`src/main.ts`** — add `import "tsconfig-paths/register"` as first line
4. **`package.json`** — update build: `"nest build && tsc-alias -p tsconfig.build.json"`, install `tsconfig-paths` (dep) + `tsc-alias` (devDep)
5. Migrate all 26 parent imports listed in the table above

### `packages/ui`

6. **`tsconfig.json`** — add `baseUrl: "."` and `paths: { "@ui/*": ["./src/*"] }`
7. **`vitest.config.ts`** — add `resolve.alias: { "@ui/": path.resolve(__dirname, "src/") }`

### `apps/web` — no changes needed (already configured)

---

## Requirement Traceability

| Requirement ID | Story                                             | Status      |
| -------------- | ------------------------------------------------- | ----------- |
| ALIAS-01       | `apps/api`: tsconfig paths configured             | Verified ✅ |
| ALIAS-02       | `apps/api`: NestJS runtime resolution             | Verified ✅ |
| ALIAS-03       | `apps/api`: Vitest resolution                     | Verified ✅ |
| ALIAS-04       | `apps/api`: All parent imports migrated           | Verified ✅ |
| ALIAS-05       | `packages/ui`: tsconfig + vitest configured       | Verified ✅ |
| ALIAS-06       | `apps/web`: already configured (regression check) | Verified ✅ |

---

## Success Criteria

- [x] `grep -rn 'from "\.\.' apps/api/src` → zero results
- [x] `pnpm typecheck` from `apps/api` → passes
- [x] `pnpm test` from `apps/api` → alias-related tests pass (pre-existing DB fixture issue in `applications.repository.spec.ts` is unrelated)
- [x] `pnpm build` from `apps/api` → builds, `tsc-alias` rewrites all `@api/*` in dist
- [x] `pnpm typecheck` from `packages/ui` → passes
- [x] `apps/web` already configured — no regressions
