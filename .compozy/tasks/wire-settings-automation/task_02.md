---
status: completed
title: "Backend auto-fill gate (autoFill input)"
type: backend
complexity: medium
dependencies: [task_01]
completed: 2026-05-24
---

# Task 02: Backend auto-fill gate (`autoFill` input)

## Overview

Add `autoFill: Boolean` to `CreateJobInput`. When creating a draft capture, start automatic fill only when `dto.autoFill === true && settings.autoFillEnabled === true`. Manual fill mutation remains ungated.

**Prerequisite:** Jobs domain refactor is complete — `JobAutomaticFillService` owns fill start/worker/TX; `JobsService` is lifecycle-only.

<requirements>
- MUST add `autoFill` field to `CreateJobInput` and internal `CreateDto`
- MUST gate in `JobsService.create()` draft-capture branch only (ignore `autoFill` on non-draft creates)
- MUST delegate fill start to `JobAutomaticFillService.fillJobAutomatically()` (not inline fill logic)
- MUST resolve circular dep via Nest `forwardRef` (`JobsService` ↔ `JobAutomaticFillService`)
- MUST add debug/info logs per TechSpec when fill skipped vs queued
- MUST add unit tests for gate matrix (see TechSpec Testing Approach)
- MUST NOT gate `fillJobAutomatically` mutation resolver path
</requirements>

## Subtasks

- [x] 2.1 Add GraphQL field + DTO mapping
- [x] 2.2 Inject `JobAutomaticFillService` (forwardRef) and implement gate after draft persistence
- [x] 2.3 Extend `jobs.service.spec.ts` with gate scenarios (mock fill service)
- [x] 2.4 Verify `pnpm --filter @job-tracker/api typecheck` and tests pass

## Success Criteria

- Draft create with `autoFill: true` + setting on returns job with `fillMetadata.status = PROCESSING`
- Draft create with setting off does not invoke fill even when `autoFill: true`
