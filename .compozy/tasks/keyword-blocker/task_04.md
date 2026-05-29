---
status: completed
title: "Blocking Integration (JobsModule + JobsService)"
type: backend
complexity: medium
dependencies: [task_02, task_03]
---

# Task 04: Blocking Integration (JobsModule + JobsService)

## Overview

Integrate the `KeywordBlockerService` and `NoteService.createPlainTextNote()` into the job creation flow in `JobsService.create()`. After normalization and company resolution, but before duplicate detection, call the blocker. On match: short-circuit stage to `REJECTED`, skip duplicate detection, create stage event with source `SYSTEM`, and attempt to create an auto-generated note via `tryRun`.

<critical>
- Read PRD § Core Features 2 (Blocking on Creation) and TechSpec § Integration Points, § Development Sequencing step 4
- Reference ADR-004 (order: blocker before duplicate) and ADR-005 (note via tryRun)
- Import `NotesModule` into `JobsModule`
- Tests required for integration flow
</critical>

<requirements>
- MUST import `NotesModule` in `JobsModule` (forwardRef if circular dep risk)
- MUST inject `KeywordBlockerService` in `JobsService`
- MUST inject `NoteService` in `JobsService`
- MUST call `keywordBlockerService.evaluate()` in `create()` between normalization and `resolveInitialStageOnCreate()`
- MUST skip duplicate detection entirely when blocker matches
- MUST set `REJECTED` stage via `this.repo.setPersistedStage()` when blocker matches
- MUST create stage event with `StageEventSourceEnum.System` and `toStage: ApplicationStageEnum.REJECTED`
- MUST call `tryRun(noteService.createPlainTextNote(...))` after stage creation — best-effort, must not fail job
- MUST log `[KeywordBlocker] Auto-note creation failed for job <id>: <error>` at WARN level when note fails
- MUST log `[KeywordBlocker] Auto-note created for job <id>` at INFO level on success
- MUST NOT affect the draft capture flow (`dto.createAsDraftCapture === true`)
- MUST format note content as `Auto-rejected by keyword blocker: keyword "<term>" matched in <scope>`

## Subtasks

- [x] Import `NotesModule` in `JobsModule`
- [x] Inject `KeywordBlockerService` and `NoteService` in `JobsService`
- [x] Call blocker in `create()` after normalization, before duplicate detection
- [x] On match: set stage REJECTED, create stage event with source SYSTEM
- [x] On match: skip duplicate detection
- [x] Add `tryRun` note creation after stage event
- [x] Add INFO/WARN logs for note creation outcome
- [x] Write unit tests for integration scenarios
- [ ] Write integration test for full flow (requires PostgreSQL — skipped)

## Implementation Details

- **Module**: `apps/api/src/domains/jobs/jobs.module.ts` — add `NotesModule` to imports, add `KeywordBlockerService` to providers (if not already)
- **Service**: `apps/api/src/domains/jobs/jobs.service.ts` — modify `create()` method
- **Note content format**: `` `Auto-rejected by keyword blocker: keyword "${verdict.keyword}" matched in ${verdict.scope}` ``

### Relevant Files

| File                                                       | Reason                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/api/src/domains/jobs/jobs.module.ts`                 | Import `NotesModule`, add `KeywordBlockerService` provider |
| `apps/api/src/domains/jobs/jobs.service.ts`                | Modify `create()` integration point                        |
| `apps/api/src/domains/jobs/job-stage-events.repository.ts` | Existing repo for stage events                             |
| `apps/api/src/domains/notes/notes.service.ts`              | `createPlainTextNote()` method (task 03)                   |
| `apps/api/src/domains/jobs/keyword-blocker.service.ts`     | `evaluate()` method (task 02)                              |

### Dependent Files

| File                                             | Reason                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| `apps/api/src/domains/jobs/jobs.service.spec.ts` | Existing tests need update for new dependency injection |
| `apps/api/src/domains/jobs/jobs.module.ts`       | Updated with NotesModule import                         |

### Related ADRs

- ADR-004: Keyword Blocking Runs Before Duplicate Detection
- ADR-005: Auto-Note Creation via NotesModule Import and Plain-Text Method
- ADR-003: Auto-generated Note on Block for Traceability

## Deliverables

- Updated `JobsModule` with `NotesModule` import
- Updated `JobsService.create()` with blocker integration
- Stage event creation on block
- Auto-generated note (best-effort)
- Unit and integration tests
- Test coverage >= 80%

## Tests

### Unit Tests — `JobsService.create()`

- [ ] Calls `keywordBlockerService.evaluate()` after normalization
- [ ] When blocker returns verdict, stage is set to REJECTED
- [ ] When blocker returns verdict, `resolveInitialStageOnCreate()` is NOT called
- [ ] When blocker returns verdict, stage event has source SYSTEM and toStage REJECTED
- [ ] When blocker returns verdict, `tryRun(noteService.createPlainTextNote(...))` is called
- [ ] When note creation fails, job is still created as REJECTED (no throw)
- [ ] When blocker returns null, normal flow continues (duplicate detection, NEW stage)
- [ ] Draft capture flow does NOT call blocker

### Integration Tests

- [ ] Create job with blocked company name → stage is REJECTED, note is created with correct content
- [ ] Create job with blocked keyword (TITLE scope, PARTIAL) → stage is REJECTED
- [ ] Create job without any blocked keyword → stage is NEW (or DUPLICATED)
- [ ] Create job with blocked keyword, Note service fails → job is still REJECTED (no note)

## Success Criteria

- All unit and integration tests passing
- Test coverage >= 80%
- Manual verification: create job with blocked keyword → REJECTED in list
- No regression in existing job creation flows
