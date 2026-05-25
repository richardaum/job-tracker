---
status: completed
title: "PM2 restart + GraphQL codegen"
type: infra
complexity: low
dependencies: [task_02]
completed: 2026-05-24
---

# Task 03: PM2 restart + GraphQL codegen

## Overview

Regenerate `schema.gql` and frontend GraphQL artifacts after `autoFill` input is added.

<requirements>
- MUST restart API (PM2) so `schema.gql` includes `autoFill` on `CreateJobInput`
- MUST run `pnpm --filter @job-tracker/web run codegen`
- MUST regenerate extension GraphQL types if applicable
- MUST NOT hand-edit generated files
</requirements>

## Success Criteria

- `apps/api/src/schema.gql` contains `autoFill` on `CreateJobInput`
- Web hooks compile with `autoFill` variable on create mutations
