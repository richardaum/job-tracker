---
status: completed
title: Codegen — Regenerate Frontend Hooks
type: chore
complexity: low
dependencies:
  - task_05
---

# Task 10: Codegen — Regenerate Frontend Hooks

## Overview

Run GraphQL codegen to regenerate all frontend hooks, types, and documents from the updated `schema.gql`. This produces typed hooks for the new `fillJobAutomatically` mutation, removes hooks for deleted draft operations (`createDraftJob`, `draftJobs`, `generateDraftJobMatch`, etc.), and updates `JobType` references to include new fields (`htmlContent`, `fillMetadata`, nullable `title`). Update frontend GraphQL operation files to remove draft-specific operations and add any new operations needed by tasks 11-12.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST restart API: `pm2 restart api` to regenerate `apps/api/src/schema.gql`
- MUST run `pnpm --filter @job-tracker/web run codegen` to regenerate hooks
- MUST remove draft-specific operations from `apps/web/src/graphql/draft-jobs.graphql` or delete the file if all operations are draft-specific
- MUST remove `GenerateDraftJobMatch` and `DraftJobMatch` operations from `apps/web/src/graphql/match.graphql`
- MUST remove `CreateJobWithAI` operation from `apps/web/src/graphql/jobs.graphql`
- MUST add `FillJobAutomatically` mutation to `apps/web/src/graphql/jobs.graphql`
- MUST update `JobSalarySelection` fragment if salary structure changed
- MUST verify generated hooks compile and typecheck passes
- SHOULD delete `apps/web/src/graphql/draft-jobs.graphql` (all operations become invalid)
- SHOULD run `pnpm fix:imports` after codegen to sort imports

</requirements>

## Subtasks

- [x] 10.1 Restart API and verify `schema.gql` is regenerated with new types — **`apps/api/src/schema.gql` already authoritative** (includes `fillJobAutomatically`); **PM2/API restart not required** for codegen
- [x] 10.2 Remove draft-specific GraphQL operations from `.graphql` files (`draft-jobs.graphql` deleted; `match.graphql` cleaned)
- [x] 10.3 Add `FillJobAutomatically` mutation to `jobs.graphql`
- [x] 10.4 Run codegen: `pnpm --filter @job-tracker/web run codegen`
- [x] 10.5 Run post-process: `pnpm --filter @job-tracker/web run codegen:postprocess` (if exists) — **handled inline** (`codegen` script runs `scripts/postprocess-codegen-hooks.mjs` after codegen)
- [x] 10.6 Run `fix:imports` scoped to `apps/web/src` and verify typecheck/test/lint for web

### Execution notes (2026-05-22)

- **Verification**: `apps/web/codegen.ts` reads `../api/src/schema.gql`; `draft-jobs.graphql` absent; `jobs.graphql` has `FillJobAutomatically`, no `CreateJobWithAI`; `match.graphql` has no `GenerateDraftJobMatch` / `DraftJobMatch`.
- **`pnpm fix:imports "apps/web/src/**/_.ts" "apps/web/src/\*\*/_.tsx"`** (repo root). **Avoid** blanket import fixes that drop `eslint-disable-next-line`— e.g.`login/page.tsx`needs`@next/next/no-location-assign-relative-destination` for cross-origin OAuth.
- **`src/gql` vs git**: Raw `pnpm codegen` can produce a large working-tree diff versus `HEAD`, but **husky `lint-staged`** (`fix-imports`, `eslint --fix`, `prettier`) on those files restores the canonical formatted output; committing only codegen without that pipeline yields an empty commit. **Tracked `apps/web/src/gql/` already matches hooked output** (includes `useFillJobAutomaticallyMutation`, no draft symbols).
- **Checks**: `pnpm --filter @job-tracker/web run typecheck`, `pnpm --filter @job-tracker/web run test` (69 tests), `pnpm --filter @job-tracker/web run lint` — all passed.

## Implementation Details

The codegen reads `apps/api/src/schema.gql` and writes generated files to `apps/web/src/gql/`. The post-process script (`scripts/postprocess-codegen-hooks.mjs`) may run automatically.

GraphQL operations to remove:

- `apps/web/src/graphql/draft-jobs.graphql` — delete entire file (DraftJobsList, DraftJobDetail, DeleteDraftJob, DeleteJobsForDraft, CreateJobWithAI, CreateDraftJob, UpdateDraftJob)
- `apps/web/src/graphql/match.graphql` — remove `DraftJobMatch` query and `GenerateDraftJobMatch` mutation fragments
- `apps/web/src/graphql/jobs.graphql` — remove `CreateJobWithAI` mutation

GraphQL operations to add:

- `apps/web/src/graphql/jobs.graphql` — add `FillJobAutomatically` mutation:

```graphql
mutation FillJobAutomatically($jobId: ID!) {
  fillJobAutomatically(jobId: $jobId) {
    id
    fillMetadata {
      status
      error
      timestamp
    }
  }
}
```

### Relevant Files

- `apps/api/src/schema.gql` — source of truth for codegen (auto-generated)
- `apps/web/codegen.ts` — codegen configuration
- `apps/web/src/gql/` — generated hooks output directory
- `apps/web/src/graphql/draft-jobs.graphql` — delete file (all draft operations)
- `apps/web/src/graphql/jobs.graphql` — remove CreateJobWithAI, add FillJobAutomatically
- `apps/web/src/graphql/match.graphql` — remove DraftJobMatch and GenerateDraftJobMatch
- `scripts/postprocess-codegen-hooks.mjs` — post-processing script

### Dependent Files

- `apps/web/src/modules/draft-jobs/` — all draft view-models that use generated hooks; will break (handled in task_13)
- `apps/web/src/modules/jobs/details/hooks/useJobDetailsViewModel.ts` — will need to use new FillJobAutomatically hook (task_11)
- `apps/web/src/modules/jobs/list/hooks/useJobsListViewModel.ts` — may need DRAFT filter enum (task_12)

### Related ADRs

- [ADR-001: Full Merge — Draft as Job Stage](../adrs/adr-001.md) — Draft GraphQL operations eliminated
- [ADR-002: Two-Phase Fill](../adrs/adr-002.md) — New FillJobAutomatically mutation added

## Deliverables

- Regenerated `apps/web/src/gql/` hooks
- Updated/cleaned GraphQL operation files
- Deleted `apps/web/src/graphql/draft-jobs.graphql`
- Unit tests with 80%+ coverage **(REQUIRED)** (for web, tests may already pass or need minor updates)

## Tests

- Unit tests:
  - [ ] Generated `useFillJobAutomaticallyMutation` hook exists and exports correctly
  - [ ] Generated `JobType` type includes `htmlContent`, `fillMetadata`, nullable `title`
  - [ ] Generated types do NOT include `DraftJobType`, `CreateDraftJobInput`, `CreateJobWithAI`
  - [ ] Generated hooks do NOT include `useCreateDraftJobMutation`, `useDraftJobsQuery`
- Integration tests:
  - [ ] Web app compiles and typechecks without draft-related type errors
  - [ ] No broken imports from deleted draft hooks
- Test coverage target: >=80%
- All tests must pass

## Success Criteria

- All tests passing
- Codegen runs without errors
- `pnpm typecheck` passes for `apps/web`
- All generated hooks match the updated API schema
- No draft-specific types or hooks exist in generated output
