---
status: completed
title: "NoteService.createPlainTextNote"
completed: 2026-05-29
type: backend
complexity: low
dependencies: []
---

# Task 03: NoteService.createPlainTextNote

## Overview

Add a `createPlainTextNote()` method to `NoteService` that creates a note without TipTap JSON validation. The auto-generated blocker note (task 04) is plain text — it cannot pass the existing `isTipTapDocumentString` check. This method provides a bypass path for plain-text notes while reusing the existing Note repository and entity.

<critical>
- Read PRD § Core Features 2 (auto-generated Note) and TechSpec § Note Service Addition
- Reference ADR-003 and ADR-005 for rationale
- Keep it simple — no revision tracking, no TipTap validation
- Tests required
</critical>

<requirements>
- MUST add `createPlainTextNote(userId, dto)` method to `NoteService`
- MUST accept `dto: { jobId: string; content: string }`
- MUST validate job exists via `this.repo.hasJob()` — returns `BadRequestException` if not found
- MUST NOT validate content as TipTap document
- MUST NOT implement revision tracking (plain-text notes are static)
- MUST call `this.repo.create()` with the same signature as existing notes
- MUST emit `JobUpdated` event after creation (matching `createNote` behavior)
- MUST throw typed NestJS exceptions (`BadRequestException`, `NotFoundException`)
</requirements>

## Subtasks

- [ ] Add `createPlainTextNote()` method to `NoteService`
- [ ] Validate job existence via repository
- [ ] Create note via repository
- [ ] Emit `JobUpdated` domain event
- [ ] Write unit tests for success and error cases

## Implementation Details

- **File**: `apps/api/src/domains/notes/notes.service.ts` — add method after existing `createNote()`
- **Pattern**: mirrors `createNote()` but skips `isTipTapDocumentString` check and revision tracking
- **Repository**: `NoteRepository` already has `hasJob()` and `create()` methods

### Relevant Files

| File                                             | Reason                             |
| ------------------------------------------------ | ---------------------------------- |
| `apps/api/src/domains/notes/notes.service.ts`    | Add `createPlainTextNote()` method |
| `apps/api/src/domains/notes/notes.repository.ts` | Provides `hasJob()` and `create()` |
| `apps/api/src/domains/notes/notes.module.ts`     | Exports `NoteService`              |

### Dependent Files

| File                                        | Reason                              |
| ------------------------------------------- | ----------------------------------- |
| `apps/api/src/domains/jobs/jobs.service.ts` | Will call this method (task 04)     |
| `apps/api/src/domains/jobs/jobs.module.ts`  | Will import `NotesModule` (task 04) |

### Related ADRs

- ADR-003: Auto-generated Note on Block for Traceability
- ADR-005: Auto-Note Creation via NotesModule Import and Plain-Text Method

## Deliverables

- Updated `NoteService` with `createPlainTextNote()` method
- Unit tests
- Test coverage >= 80%

## Tests

### Unit Tests — `NoteService.createPlainTextNote()`

- [ ] Creates note successfully with valid jobId and plain text content
- [ ] Throws `BadRequestException` when job does not exist
- [ ] Emits `JobUpdated` event on successful creation
- [ ] Returns created Note object with correct content

## Success Criteria

- All unit tests passing
- Test coverage >= 80%
- Method creates notes without TipTap validation error
- Existing `createNote()` still validates TipTap content (no regression)
