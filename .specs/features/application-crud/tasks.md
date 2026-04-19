# Application CRUD — Tasks

**Spec:** `.specs/features/application-crud/spec.md`
**Status:** Planned

---

## Execution Plan

### Phase 1: Data Layer (Sequential)

```
T01 ──→ T02 ──→ T03
```

### Phase 2: Service + Codegen (Parallel)

```
T03 ──┬── T04 [P]
      └── T07 [P]
```

### Phase 3: API Layer (Sequential)

```
T04 ──→ T05 ──→ T06
```

### Phase 4: UI Components (Parallel)

```
T07 ──┬── T08 [P]
      ├── T09 [P]
      ├── T10 [P]
      └── T11 [P]
```

### Phase 5: Pages (Sequential)

```
T05, T08, T09, T10, T11 ──→ T12 ──→ T13
```

---

## Task Breakdown

### T01: Application Drizzle schema

**What:** Define the `applications` table schema using Drizzle ORM
**Where:** `apps/api/src/applications/applications.schema.ts`
**Depends on:** google-oauth T01 (users schema exists)
**Requirement:** AC-01

**Done when:**

- [ ] Schema defines: `id`, `userId` (FK → users), `title`, `company`, `url`, `appliedAt`, `createdAt`, `updatedAt`
- [ ] Foreign key to `users.id` with `onDelete: 'cascade'`
- [ ] No TypeScript errors

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/api build`

---

### T02: Applications migration

**What:** Generate and apply Drizzle migration for the `applications` table
**Where:** `apps/api/src/database/migrations/`
**Depends on:** T01
**Requirement:** AC-01

**Done when:**

- [ ] `drizzle-kit generate` produces migration for `applications` table
- [ ] `drizzle-kit migrate` applies it without errors
- [ ] Migration is idempotent

**Tests:** none
**Gate:** build — `drizzle-kit migrate`

---

### T03: ApplicationRepository

**What:** Create `ApplicationRepository` with CRUD methods scoped to `userId`
**Where:** `apps/api/src/applications/applications.repository.ts`, `apps/api/src/applications/applications.repository.spec.ts`
**Depends on:** T02
**Requirement:** AC-01, AC-02, AC-03, AC-04, AC-05

**Done when:**

- [ ] `findAllByUserId(userId)` returns only the user's applications
- [ ] `findOneByIdAndUserId(id, userId)` returns `null` if not found or wrong owner
- [ ] `create(userId, dto)`, `update(id, userId, dto)`, `delete(id, userId)` implemented
- [ ] Integration tests cover all methods including ownership isolation
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — integration tests pass

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T04: ApplicationService [P]

**What:** Create `ApplicationService` with CRUD business logic and ownership enforcement
**Where:** `apps/api/src/applications/applications.service.ts`, `apps/api/src/applications/applications.service.spec.ts`
**Depends on:** T03
**Requirement:** AC-01, AC-02, AC-03, AC-04, AC-05

**Done when:**

- [ ] `findAll(userId)`, `findOne(id, userId)`, `create(userId, dto)`, `update(id, userId, dto)`, `remove(id, userId)` implemented
- [ ] `findOne` throws `NotFoundException` when application not found or not owned by user
- [ ] `remove` throws `NotFoundException` when application not found or not owned
- [ ] Unit tests mock `ApplicationRepository` and assert all methods + error cases
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — 5+ unit tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/api vitest run`

---

### T05: ApplicationResolver

**What:** Create GraphQL resolver with queries and mutations for application CRUD
**Where:** `apps/api/src/applications/applications.resolver.ts`, `apps/api/src/applications/applications.resolver.spec.ts`
**Depends on:** T04
**Requirement:** AC-01, AC-02, AC-03, AC-04

**Done when:**

- [ ] `Query.applications` returns all applications for the current user
- [ ] `Query.application(id)` returns one application (or 404)
- [ ] `Mutation.createApplication(input)` creates and returns the new application
- [ ] `Mutation.updateApplication(id, input)` updates and returns the application
- [ ] `Mutation.deleteApplication(id)` removes and returns `true`
- [ ] All endpoints protected with `@UseGuards(JwtAuthGuard)` and `@Roles('user')`
- [ ] Integration tests cover all operations with valid JWT
- [ ] Gate: `pnpm --filter @job-tracker/api vitest run` — integration tests pass

**Tests:** integration
**Gate:** full — `pnpm --filter @job-tracker/api vitest run`

---

### T06: ApplicationModule

**What:** Wire all application providers into `ApplicationModule`
**Where:** `apps/api/src/applications/applications.module.ts`
**Depends on:** T05
**Requirement:** AC-01

**Done when:**

- [ ] `ApplicationModule` registers `ApplicationRepository`, `ApplicationService`, `ApplicationResolver`
- [ ] Module imported in `AppModule`
- [ ] `pnpm --filter @job-tracker/api build` passes

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/api build`

---

### T07: GraphQL Code Generator setup [P]

**What:** Configure GraphQL Code Generator in `apps/web` to generate typed Apollo hooks from the API schema
**Where:** `apps/web/codegen.ts`, `apps/web/src/gql/`
**Depends on:** T03
**Requirement:** AC-02

**Done when:**

- [ ] `codegen.ts` points to the API GraphQL endpoint (or schema file)
- [ ] `pnpm --filter @job-tracker/web codegen` generates typed hooks into `src/gql/`
- [ ] Generated files include typed `useApplicationsQuery`, `useCreateApplicationMutation`, etc.
- [ ] `codegen` script added to `apps/web/package.json`

**Tests:** none
**Gate:** build — `pnpm --filter @job-tracker/web codegen && pnpm --filter @job-tracker/web build`

---

### T08: ApplicationCard component [P]

**What:** Create `ApplicationCard` component displaying one application's key fields
**Where:** `packages/ui/src/components/ApplicationCard/`
**Depends on:** T07
**Requirement:** AC-02

**Done when:**

- [ ] Displays `title`, `company`, `appliedAt` and action buttons (edit, delete)
- [ ] `ApplicationCard.test.tsx` — renders all fields and fires action callbacks
- [ ] `ApplicationCard.stories.tsx` — `Default` and `WithLongTitle` stories pass
- [ ] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [ ] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook

---

### T09: CreateApplicationForm component [P]

**What:** Create `CreateApplicationForm` component with controlled inputs for all fields
**Where:** `packages/ui/src/components/CreateApplicationForm/`
**Depends on:** T07
**Requirement:** AC-01

**Done when:**

- [ ] Form has inputs for `title`, `company`, `url`, `appliedAt` with basic validation
- [ ] Calls `onSubmit(data)` prop on valid submission
- [ ] `CreateApplicationForm.test.tsx` — renders, validates, and submits
- [ ] `CreateApplicationForm.stories.tsx` — `Default` and `WithError` stories pass
- [ ] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [ ] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook

---

### T10: EditApplicationForm component [P]

**What:** Create `EditApplicationForm` component pre-populated with existing application data
**Where:** `packages/ui/src/components/EditApplicationForm/`
**Depends on:** T07
**Requirement:** AC-03

**Done when:**

- [ ] Accepts `defaultValues` prop and pre-fills all fields
- [ ] Calls `onSubmit(data)` and `onCancel()` props
- [ ] `EditApplicationForm.test.tsx` — renders with defaults, submits updated values
- [ ] `EditApplicationForm.stories.tsx` — `Default` story passes
- [ ] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [ ] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook

---

### T11: DeleteApplicationDialog component [P]

**What:** Create `DeleteApplicationDialog` confirmation dialog component
**Where:** `packages/ui/src/components/DeleteApplicationDialog/`
**Depends on:** T07
**Requirement:** AC-04

**Done when:**

- [ ] Dialog (Radix `AlertDialog`) shows application title and confirm/cancel buttons
- [ ] Calls `onConfirm()` and `onCancel()` props
- [ ] `DeleteApplicationDialog.test.tsx` — renders, confirms, cancels
- [ ] `DeleteApplicationDialog.stories.tsx` — `Open` story passes
- [ ] Gate (unit): `pnpm --filter @job-tracker/ui vitest run` — tests pass
- [ ] Gate (visual): `pnpm --filter @job-tracker/ui test-storybook` — stories pass

**Tests:** unit + visual
**Gate:** quick + storybook

---

### T12: ApplicationList page

**What:** Create the main applications list page using generated hooks and UI components
**Where:** `apps/web/src/app/(authenticated)/applications/page.tsx`, `apps/web/src/app/(authenticated)/applications/page.test.tsx`
**Depends on:** T05, T08, T09, T10, T11
**Requirement:** AC-01, AC-02, AC-03, AC-04

**Done when:**

- [ ] Uses `useApplicationsQuery` to fetch and display `ApplicationCard` list
- [ ] "New Application" button opens `CreateApplicationForm` (modal or inline)
- [ ] Edit and delete actions wire to their respective mutations
- [ ] Unit test mocks Apollo and asserts the list renders correctly
- [ ] Gate: `pnpm --filter @job-tracker/web vitest run` — 1+ tests pass

**Tests:** unit
**Gate:** quick — `pnpm --filter @job-tracker/web vitest run`

---

### T13: Application CRUD e2e test

**What:** Write Playwright e2e test covering the full create → view → edit → delete flow
**Where:** `apps/web/e2e/applications.spec.ts`
**Depends on:** T12
**Requirement:** AC-01, AC-02, AC-03, AC-04, AC-05

**Done when:**

- [ ] Test logs in (mocked Google OAuth or seeded session)
- [ ] Creates an application and asserts it appears in the list
- [ ] Edits the application and asserts updated values are shown
- [ ] Deletes the application and asserts it is removed from the list
- [ ] Gate: `pnpm --filter @job-tracker/web exec playwright test` — e2e tests pass

**Tests:** e2e
**Gate:** e2e — `pnpm --filter @job-tracker/web exec playwright test`

---

## Parallel Execution Map

```
Phase 1:  T01 ──→ T02 ──→ T03

Phase 2:  T03 ──┬── T04 [P]
                └── T07 [P]

Phase 3:  T04 ──→ T05 ──→ T06

Phase 4:  T07 ──┬── T08 [P]
                ├── T09 [P]
                ├── T10 [P]
                └── T11 [P]

Phase 5:  T05, T08, T09, T10, T11 ──→ T12 ──→ T13
```

---

## Granularity Check

| Task                         | Scope                              | Status |
| ---------------------------- | ---------------------------------- | ------ |
| T01: Application schema      | 1 schema file                      | ✅     |
| T02: Applications migration  | 1 migration                        | ✅     |
| T03: ApplicationRepository   | 1 class + 1 test                   | ✅     |
| T04: ApplicationService      | 1 service + 1 test                 | ✅     |
| T05: ApplicationResolver     | 1 resolver + 1 test                | ✅     |
| T06: ApplicationModule       | 1 module file                      | ✅     |
| T07: GraphQL codegen setup   | 1 config + generated files         | ✅     |
| T08: ApplicationCard         | 3 files (component + test + story) | ✅     |
| T09: CreateApplicationForm   | 3 files (component + test + story) | ✅     |
| T10: EditApplicationForm     | 3 files (component + test + story) | ✅     |
| T11: DeleteApplicationDialog | 3 files (component + test + story) | ✅     |
| T12: ApplicationList page    | 1 page + 1 test                    | ✅     |
| T13: Application CRUD e2e    | 1 spec file                        | ✅     |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body)       | Diagram Shows | Status |
| ---- | ----------------------- | ------------- | ------ |
| T01  | google-oauth T01        | start         | ✅     |
| T02  | T01                     | T01 → T02     | ✅     |
| T03  | T02                     | T02 → T03     | ✅     |
| T04  | T03                     | T03 → T04     | ✅     |
| T05  | T04                     | T04 → T05     | ✅     |
| T06  | T05                     | T05 → T06     | ✅     |
| T07  | T03                     | T03 → T07     | ✅     |
| T08  | T07                     | T07 → T08     | ✅     |
| T09  | T07                     | T07 → T09     | ✅     |
| T10  | T07                     | T07 → T10     | ✅     |
| T11  | T07                     | T07 → T11     | ✅     |
| T12  | T05, T08, T09, T10, T11 | all → T12     | ✅     |
| T13  | T12                     | T12 → T13     | ✅     |

---

## Test Co-location Validation

| Task | Layer Created                | Matrix Requires | Task Says     | Status |
| ---- | ---------------------------- | --------------- | ------------- | ------ |
| T01  | schema (config)              | none            | none          | ✅     |
| T02  | migration (config)           | none            | none          | ✅     |
| T03  | Repository + real DB         | integration     | integration   | ✅     |
| T04  | Service (api)                | unit            | unit          | ✅     |
| T05  | GraphQL resolver             | integration     | integration   | ✅     |
| T06  | Module wiring                | none            | none          | ✅     |
| T07  | codegen config               | none            | none          | ✅     |
| T08  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T09  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T10  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T11  | React component (ui) + story | unit + visual   | unit + visual | ✅     |
| T12  | Hook / util (web)            | unit            | unit          | ✅     |
| T13  | Full user flow               | e2e             | e2e           | ✅     |
