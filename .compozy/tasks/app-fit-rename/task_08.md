---
status: pending
title: "Regenerate web codegen after schema rename"
type: web
complexity: medium
dependencies: [01, 02, 03, 04, 05, 06, 07]
---

# Task 08: Regenerate web codegen after schema rename

**Prerequisite:** All Phase 1 API changes (Tasks 01–07) must be complete and `pnpm typecheck` passing in `apps/api`.

## Action

```bash
pnpm --filter @job-tracker/web run codegen
```

This regenerates `apps/web/src/gql/` with the new schema names (hooks, types, documents).

## What gets regenerated

- Generated hooks: `useJobsQuery`, `useCreateJobMutation`, etc.
- Types: `Job`, `DraftJob`, `CreateJobInput`, etc.
- Documents: inline GraphQL strings in generated files

## Verification

```bash
pnpm --filter @job-tracker/web run typecheck
```
