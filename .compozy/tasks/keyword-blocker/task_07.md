---
status: completed
title: "Seed Datafix Script"
type: backend
complexity: medium
dependencies: [task_01]
---

# Task 07: Seed Datafix Script

## Overview

Create a datafix script `fix-seed-blocked-keywords.ts` that reads legacy blocked keywords from the SQLite database at `/Users/richardaum/projects/linkedin/linkedin_jobs.db`, maps them to the new `BlockedKeyword` structure, and upserts them into the user's settings. The script follows the existing `fix-*` pattern with NestJS DI and `--dry-run` support.

<critical>
- Read PRD § Core Features 3 (Seed Datafix) and TechSpec § "Build Order" step 7
- Follow existing datafix patterns in `apps/api/scripts/`
- Support `--dry-run` flag
- Legacy SQLite must be accessible (read-only)
- Tests for mapping logic
</critical>

<requirements>
- MUST create `apps/api/scripts/fix-seed-blocked-keywords.ts` following existing `fix-*` patterns
- MUST use `NestFactory.createApplicationContext` for NestJS DI
- MUST connect to legacy SQLite at `/Users/richardaum/projects/linkedin/linkedin_jobs.db` (read-only)
- MUST read `forbidden_keywords` table from legacy DB (or equivalent)
- MUST map legacy types: `title` → scope `TITLE`, `partial` → scope `DESCRIPTION`, `company` → scope `COMPANY`, `job` → scope `DESCRIPTION`
- MUST set all matchMode to `PARTIAL` (matching legacy behavior)
- MUST upsert into `UserSettingEntity.blockedKeywords` for the configured user
- MUST support `--dry-run` flag that prints what would be inserted without saving
- MUST output summary of how many keywords inserted per user
- MUST exit with clear error if legacy SQLite database is not accessible
- MUST NOT require raw SQL — use repositories or EntityManager

## Subtasks

- [x] Create script following `fix-*` pattern with NestJS DI
- [x] Connect to legacy SQLite database
- [x] Read and map legacy keywords to `BlockedKeyword` structure
- [x] Implement upsert to user settings
- [x] Implement `--dry-run` mode
- [x] Write unit tests for mapping logic
- [x] Test script against real legacy data

## Implementation Details

- **Script path**: `apps/api/scripts/fix-seed-blocked-keywords.ts`
- **Pattern**: follow existing `fix-normalize-enum-casing.ts` or `fix-generated-at.ts` from `apps/api/scripts/`
- **Legacy DB path**: `/Users/richardaum/projects/linkedin/linkedin_jobs.db`
- **Legacy table**: `forbidden_keywords` with columns: `keyword`, `type` (values: `title`, `partial`, `company`, `job`)
- **Mapping**:
  - `title` → `{ keyword, scope: "TITLE", matchMode: "PARTIAL" }`
  - `partial` → `{ keyword, scope: "DESCRIPTION", matchMode: "PARTIAL" }`
  - `company` → `{ keyword, scope: "COMPANY", matchMode: "PARTIAL" }`
  - `job` → `{ keyword, scope: "DESCRIPTION", matchMode: "PARTIAL" }`

### Relevant Files

| File                                                    | Reason                        |
| ------------------------------------------------------- | ----------------------------- |
| `apps/api/scripts/fix-normalize-enum-casing.ts`         | Reference for datafix pattern |
| `apps/api/scripts/fix-generated-at.ts`                  | Reference for NestJS DI setup |
| `apps/api/src/domains/settings/settings.service.ts`     | For updating user settings    |
| `apps/api/src/database/entities/user-setting.entity.ts` | Entity to update              |

### Dependent Files

| File                             | Reason |
| -------------------------------- | ------ |
| None — script runs independently |        |

### Related ADRs

- ADR-001: Structured Keyword Blocking with Per-Keyword Scope

## Deliverables

- `apps/api/scripts/fix-seed-blocked-keywords.ts` datafix script
- Unit tests for mapping functions
- Script supports `--dry-run` and `--user-id` flags
- Test coverage >= 80%

## Tests

### Unit Tests — Mapping Logic

- [x] `title` legacy type maps to `TITLE` scope, `PARTIAL` matchMode
- [x] `partial` legacy type maps to `DESCRIPTION` scope, `PARTIAL` matchMode
- [x] `company` legacy type maps to `COMPANY` scope, `PARTIAL` matchMode
- [x] `job` legacy type maps to `DESCRIPTION` scope, `PARTIAL` matchMode
- [x] Unknown legacy type throws or skips with warning

### Integration Tests

- [x] Script runs with `--dry-run` outputs correct summary
- [x] Script runs without `--dry-run` upserts keywords into user settings
- [x] Script errors gracefully when legacy DB not accessible
- [x] Existing keywords in user settings are preserved (upsert merges)

## Success Criteria

- All tests passing
- Test coverage >= 80%
- Script runs successfully against legacy SQLite
- `--dry-run` shows correct mapping output without persisting
- User settings contain legacy keywords after script execution
