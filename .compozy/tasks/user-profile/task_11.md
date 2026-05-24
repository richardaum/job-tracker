---
status: completed
title: "Tests + final validation"
type: test
complexity: high
dependencies:
  [
    task_01,
    task_02,
    task_03,
    task_04,
    task_05,
    task_06,
    task_07,
    task_08,
    task_09,
    task_10,
  ]
---

# Task 11: Tests + final validation

## Overview

Implement all tests defined in the TechSpec § Test Coverage section, covering API service/resolver unit tests, frontend component tests for all new/modified components, and E2E tests for the complete profile flow. Run full validation: typecheck, lint, tests, and knip dead-code check.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement all test files listed in TechSpec § Test Coverage
- MUST follow existing test patterns: Vitest + SWC for API, Vitest + @testing-library/react + jsdom for web, Playwright for E2E
- MUST use mock patterns from existing tests: `vi.mock("next/navigation")`, `vi.mock("@/gql/hooks")`, NestJS `Test.createTestingModule` with guard overrides
- MUST achieve >=80% test coverage on new code
- MUST run `pnpm --filter api typecheck`, `pnpm --filter web typecheck` — zero new errors
- MUST run `pnpm lint` — zero new warnings
- MUST run `pnpm test` — all tests pass
- MUST run `pnpm knip` — no dead code
</requirements>

## Subtasks

- [ ] 11.1 Implement API tests:
  - `domains/settings/settings.service.spec.ts` — unit tests for SettingsService
  - `domains/settings/settings.resolver.spec.ts` — integration tests for SettingsResolver
  - Update `domains/jobs/jobs.service.spec.ts` — mock SettingsService for duplicate window
- [ ] 11.2 Implement web component tests:
  - `modules/profile/layout/page/ProfileShell.test.tsx`
  - `modules/profile/identity/page/IdentityTabPage.test.tsx`
  - `modules/profile/settings/page/SettingsTabPage.test.tsx`
  - `modules/profile/resumes/page/ResumesTabPage.test.tsx`
  - `modules/profile/preferences/page/PreferencesTabPage.test.tsx`
  - `modules/resumes/list/components/ResumesList.test.tsx`
  - `modules/work-preferences/components/WorkPreferencesEditor.test.tsx`
  - `modules/navigation/components/Sidebar.test.tsx`
- [ ] 11.3 Implement E2E test: `apps/web/e2e/profile.spec.ts`
- [ ] 11.4 Run `pnpm --filter api typecheck` + `pnpm --filter web typecheck`
- [ ] 11.5 Run `pnpm lint`
- [ ] 11.6 Run `pnpm test`
- [ ] 11.7 Run `pnpm knip`

## Implementation Details

See TechSpec § Test Coverage for exact test file paths, types, and what to test for each file.

### API Test Patterns

- **Service tests**: Mock `UserSettingRepository` via `as unknown as`, or use NestJS `Test.createTestingModule`
- **Resolver tests**: Use `Test.createTestingModule` with `GraphQLModule.forRoot`, mock service, override guards with `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })`
- Follow existing patterns in `resumes.resolver.spec.ts` and `work-preferences.resolver.spec.ts`

### Web Test Patterns

- Mock `next/navigation`: `vi.mock("next/navigation", () => ({ useRouter: vi.fn(...), usePathname: vi.fn(...), useSearchParams: vi.fn(...) }))`
- Mock `@/gql/hooks`: `vi.mock("@/gql/hooks", async () => { ...vi.importActual..., useSettingsQuery: vi.fn(...) })`
- Mock `@/hooks/useCurrentUser`: return mock user with name, email, avatarUrl
- Follow existing patterns in `AddResumeDialog.test.tsx` and `SourcesPage.test.tsx`

### E2E Test Pattern

- Auth bypass: `page.goto("/auth/google?returnTo=/profile")`
- Test flow: login → navigate to `/profile` via sidebar user card → verify 4 tabs → toggle settings → create+delete resume → edit preferences
- Follow existing E2E patterns in `apps/web/e2e/`

### Relevant Files

- `apps/api/src/domains/settings/settings.service.ts` — service to test
- `apps/api/src/domains/settings/settings.resolver.ts` — resolver to test
- `apps/api/src/domains/resumes/resumes.resolver.spec.ts` — resolver test pattern
- `apps/web/src/modules/resumes/list/components/AddResumeDialog.test.tsx` — component test pattern
- `apps/web/src/modules/sources/page/SourcesPage.test.tsx` — page test pattern
- `apps/web/src/hooks/useCurrentUser.test.ts` — hook test / mock pattern
- `apps/web/e2e/` — E2E test directory and patterns

### Dependent Files

None — this is the final validation step.

### Related ADRs

None specific to testing — follow existing project test conventions.

## Deliverables

- `apps/api/src/domains/settings/settings.service.spec.ts`
- `apps/api/src/domains/settings/settings.resolver.spec.ts`
- Updated `apps/api/src/domains/jobs/jobs.service.spec.ts`
- `apps/web/src/modules/profile/layout/page/ProfileShell.test.tsx`
- `apps/web/src/modules/profile/identity/page/IdentityTabPage.test.tsx`
- `apps/web/src/modules/profile/settings/page/SettingsTabPage.test.tsx`
- `apps/web/src/modules/profile/resumes/page/ResumesTabPage.test.tsx`
- `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.test.tsx`
- `apps/web/src/modules/resumes/list/components/ResumesList.test.tsx`
- `apps/web/src/modules/work-preferences/components/WorkPreferencesEditor.test.tsx`
- Updated `apps/web/src/modules/navigation/components/Sidebar.test.tsx`
- `apps/web/e2e/profile.spec.ts`

## Tests

This task is the test task itself. Verification:

- [ ] All API tests pass (`pnpm --filter api test`)
- [ ] All web tests pass (`pnpm --filter web test`)
- [ ] E2E tests pass (`pnpm e2e`)
- [ ] Test coverage >=80% on all new files

## Success Criteria

- `pnpm --filter api typecheck` — zero new errors
- `pnpm --filter web typecheck` — zero new errors
- `pnpm lint` — zero new warnings
- `pnpm test` — all tests pass, coverage >=80%
- `pnpm knip` — no dead code
- PM2 logs clean: `pm2 logs api --lines 30 --nostream` — no new errors
- E2E profile spec passes
