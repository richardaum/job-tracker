---
status: completed
title: "KeywordBlockerService"
type: backend
complexity: medium
dependencies: [task_01]
---

# Task 02: KeywordBlockerService

## Overview

Create the `KeywordBlockerService` with an `evaluate()` method that checks a job's title, description, and company name against the user's blocked keywords and companies. The service reads from user settings (JSONB columns added in task 01) and returns a `BlockVerdict` on match or `null` if no keyword matches.

<critical>
- Read PRD § Core Features 2 (Blocking on Creation) and TechSpec § Core Interfaces
- Reference TechSpec § "Build Order" step 2
- Evaluate only — do NOT modify job state or create anything
- Tests required for all match modes, scopes, edge cases
</critical>

<requirements>
- MUST inject `SettingsService` (already available via `SettingsModule` export)
- MUST implement `evaluate(userId, title, description, companyName): Promise<BlockVerdict | null>`
- MUST check `blockedCompanies` first (case-insensitive exact match on company name)
- MUST iterate `blockedKeywords` and check each keyword against its configured `scope`
- MUST support `PARTIAL` mode (case-insensitive substring match)
- MUST support `EXACT` mode (case-insensitive full string match)
- MUST extract plain text from TipTap JSON description before matching (use existing `extractPlainText` helper or implement inline)
- MUST return `{ matched: true, keyword, scope }` on first match
- MUST return `null` when no keyword matches (including empty keyword/company lists)
- MUST be registered as a provider in `JobsModule`
- MUST define types in `apps/api/src/domains/jobs/keyword-blocker.types.ts` (shared types file)
- MUST log matched blocks at INFO level with format `[KeywordBlocker] Blocked — keyword "<term>" matched in <scope>`
</requirements>

## Subtasks

- [x] Create `keyword-blocker.types.ts` with `BlockVerdict` interface and `KeywordScope`, `MatchMode` type aliases/re-exports
- [x] Create `KeywordBlockerService` with `evaluate()` method
- [x] Implement `blockedCompanies` exact match (case-insensitive)
- [x] Implement `blockedKeywords` iteration with scope-aware target selection
- [x] Implement PARTIAL and EXACT match modes
- [x] Implement TipTap JSON description text extraction
- [x] Add INFO log on match
- [x] Register `KeywordBlockerService` in `JobsModule`
- [x] Write unit tests for every match scenario

## Implementation Details

- **New file**: `apps/api/src/domains/jobs/keyword-blocker.types.ts` — `BlockVerdict` type, re-export `KeywordScope`, `MatchMode` from settings types
- **New file**: `apps/api/src/domains/jobs/keyword-blocker.service.ts` — `KeywordBlockerService` class
- **Module**: `apps/api/src/domains/jobs/jobs.module.ts` — add `KeywordBlockerService` to providers
- **Settings access**: use `SettingsService.getSettings(userId)` (already injectable, `SettingsModule` imported in `JobsModule`)
- **BlockedKeywords shape**: `Array<{ keyword: string; scope: "TITLE" | "DESCRIPTION" | "COMPANY"; matchMode: "PARTIAL" | "EXACT" }>`

### Relevant Files

| File                                                     | Reason                                        |
| -------------------------------------------------------- | --------------------------------------------- |
| `apps/api/src/domains/settings/settings.service.ts`      | Provides `getSettings()` to read blocked data |
| `apps/api/src/domains/settings/keyword-blocker.types.ts` | Re-exports types for BlockedKeyword           |
| `apps/api/src/domains/jobs/jobs.module.ts`               | Register new service provider                 |
| `apps/api/src/domains/jobs/jobs.service.ts`              | Will call `evaluate()` (task 04)              |

### Dependent Files

| File                                                        | Reason                                |
| ----------------------------------------------------------- | ------------------------------------- |
| `apps/api/src/domains/jobs/jobs.service.ts`                 | Will consume blocker result (task 04) |
| `apps/api/src/domains/jobs/jobs.module.ts`                  | Updated with new provider             |
| `apps/api/src/domains/jobs/keyword-blocker.service.spec.ts` | Test file                             |

### Related ADRs

- ADR-001: Structured Keyword Blocking with Per-Keyword Scope
- ADR-004: Keyword Blocking Runs Before Duplicate Detection

## Deliverables

- `apps/api/src/domains/jobs/keyword-blocker.types.ts` with `BlockVerdict` type
- `apps/api/src/domains/jobs/keyword-blocker.service.ts` with `evaluate()` method
- `KeywordBlockerService` registered in `JobsModule`
- Unit tests covering all match scenarios
- Test coverage >= 80%

## Tests

### Unit Tests — `KeywordBlockerService.evaluate()`

- [x] Empty blocked keywords list returns null
- [x] Empty blocked companies list returns null
- [x] Blocked company exact match returns `{ matched: true, scope: "COMPANY" }`
- [x] Blocked company case-insensitive match returns verdict
- [x] Blocked company no match returns null
- [x] Keyword EXACT match on TITLE returns `{ matched: true, scope: "TITLE" }`
- [x] Keyword PARTIAL match on TITLE returns verdict
- [x] Keyword no match on TITLE returns null
- [x] Keyword EXACT match on DESCRIPTION (plain text) returns `{ matched: true, scope: "DESCRIPTION" }`
- [x] Keyword PARTIAL match on DESCRIPTION (TipTap JSON) returns verdict
- [x] Keyword COMPANY scope matches company name
- [x] First matching keyword wins (order of keywords array)
- [x] Null/empty description does not throw

## Success Criteria

- All unit tests passing
- Test coverage >= 80%
- `evaluate()` correctly distinguishes all scopes and match modes
- Edge cases handled (empty strings, null description, TipTap JSON)
