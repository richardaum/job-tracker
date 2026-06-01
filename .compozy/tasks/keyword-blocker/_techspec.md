# TechSpec: Keyword Blocker

## Executive Summary

Add keyword-based blocking to automatically reject jobs on creation. Blocked keywords and companies live in two new JSONB columns on the existing `user_settings` table. A new `KeywordBlockerService` checks the job title, description, and company name against the user's block list during creation. On match, the stage short-circuits to `REJECTED` before duplicate detection runs. An auto-generated Note documents the match. The REJECTED quick filter lets users inspect blocked jobs. A datafix script seeds the initial list from the legacy SQLite database.

Primary trade-off: blocking is evaluated at creation time only — no retroactive re-evaluation when keywords change. This avoids surprise disappearing jobs and keeps query performance predictable.

## System Architecture

### Component Overview

| Component                       | Responsibility                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `UserSettingEntity`             | Stores `blockedKeywords` (JSONB array of `BlockedKeyword`) and `blockedCompanies` (JSONB array of strings) |
| `KeywordBlockerService`         | Evaluates a job against the user's block list; returns verdict or null                                     |
| `JobsService`                   | Calls `KeywordBlockerService` after normalization, before duplicate detection                              |
| `NoteService`                   | New `createPlainTextNote()` method for auto-generated notes                                                |
| `ApplicationQuickFilterEnum`    | Gains `REJECTED` value                                                                                     |
| `JobsListQuery`                 | Handles `REJECTED` filter in query builder                                                                 |
| Settings UI (`SettingsTabPage`) | New "Blocked Keywords" section with keyword rows and company input                                         |

**Data flow during job creation:**

```
normalize data → resolveCompanyId
  → KeywordBlockerService.evaluate() → if match: stage = REJECTED
  → resolveInitialStageOnCreate() [skipped if already REJECTED]
  → setPersistedStage() + createStageEvent()
  → create auto-note (tryRun, best-effort)
  → emit JobCreated
```

### External Interactions

None. The blocker reads only from the same database (user settings) and writes to the same tables (jobs, stage events, notes).

## Implementation Design

### Core Interfaces

```typescript
// apps/api/src/domains/jobs/keyword-blocker.types.ts
type KeywordScope = "TITLE" | "DESCRIPTION" | "COMPANY";
type MatchMode = "PARTIAL" | "EXACT";

interface BlockedKeyword {
  keyword: string;
  scope: KeywordScope;
  matchMode: MatchMode;
}

interface BlockVerdict {
  matched: true;
  keyword: string;
  scope: KeywordScope;
}

// Apps/api/src/domains/jobs/keyword-blocker.service.ts
@Injectable()
export class KeywordBlockerService {
  constructor(private readonly settingsService: SettingsService) {}

  async evaluate(
    userId: string,
    title: string,
    description: string | null,
    companyName: string,
  ): Promise<BlockVerdict | null> {
    const settings = await this.settingsService.getSettings(userId);
    const keywords = (settings.blockedKeywords ?? []) as BlockedKeyword[];
    const companies = (settings.blockedCompanies ?? []) as string[];

    // Check blocked companies (exact match on company.name)
    if (companies.some((c) => c.toLowerCase() === companyName.toLowerCase())) {
      return { matched: true, keyword: companyName, scope: "COMPANY" };
    }

    // Check keywords by scope
    for (const bk of keywords) {
      const target = bk.scope === "TITLE" ? title : bk.scope === "DESCRIPTION" ? (description ?? "") : companyName;
      const match =
        bk.matchMode === "EXACT"
          ? target.toLowerCase() === bk.keyword.toLowerCase()
          : target.toLowerCase().includes(bk.keyword.toLowerCase());
      if (match) {
        return { matched: true, keyword: bk.keyword, scope: bk.scope };
      }
    }

    return null;
  }
}
```

### Data Models

**Entity changes** (`apps/api/src/database/entities/user-setting.entity.ts`):

```typescript
import { BlockedKeyword } from "../../domains/jobs/keyword-blocker.types";

@Column({ name: "blocked_keywords", type: "jsonb", default: [] })
blockedKeywords!: BlockedKeyword[];

@Column({ name: "blocked_companies", type: "jsonb", default: [] })
blockedCompanies!: string[];
```

**GraphQL type changes** (`apps/api/src/domains/settings/user-setting.type.ts`):

```typescript
@Field(() => [BlockedKeywordType], { nullable: true })
blockedKeywords?: BlockedKeywordType[];

@Field(() => [String], { nullable: true })
blockedCompanies?: string[];
```

**New GraphQL types** (`apps/api/src/domains/settings/keyword-blocker.types.ts`):

```typescript
@ObjectType("BlockedKeyword")
export class BlockedKeywordType {
  @Field() keyword!: string;
  @Field(() => String) scope!: KeywordScope; // registerEnumType
  @Field(() => String) matchMode!: MatchMode; // registerEnumType
}
```

**Input changes** (`apps/api/src/domains/settings/update-settings.input.ts`):

```typescript
@Field(() => [BlockedKeywordInput], { nullable: true })
blockedKeywords?: BlockedKeywordInput[];

@Field(() => [String], { nullable: true })
blockedCompanies?: string[];
```

### API Endpoints

No new endpoints. Existing `updateSettings` mutation gains two optional fields:

```
mutation UpdateSettings($input: UpdateSettingsInput!) {
  updateSettings(input: $input) { ... }
}
```

| Field              | Type                     | Notes                            |
| ------------------ | ------------------------ | -------------------------------- |
| `blockedKeywords`  | `[BlockedKeywordInput!]` | Full replacement of keyword list |
| `blockedCompanies` | `[String!]`              | Full replacement of company list |

Both are full-replacement — the client sends the complete list on every change (existing `Object.assign` pattern in `SettingsService.updateSettings` already handles partial updates with explicit `undefined`).

### Note Service Addition

```typescript
// In NoteService
async createPlainTextNote(
  userId: string,
  dto: { jobId: string; content: string },
): Promise<Note> {
  const exists = await this.repo.hasJob(dto.jobId, userId);
  if (!exists) throw new BadRequestException("Job not found");
  return this.repo.create(userId, { jobId: dto.jobId, content: dto.content });
}
```

### Settings UI (Frontend)

New collapsible section in `SettingsTabPage`:

- **Blocked Companies**: tag-style input (existing shadcn/ui `Input` with comma/enter separation) saving to `blockedCompanies`.
- **Blocked Keywords**: list of keyword rows (keyword text, scope badge, match mode badge, delete button). Add form: text input + scope dropdown (`TITLE`/`DESCRIPTION`/`COMPANY`) + match mode toggle (`PARTIAL`/`EXACT`) + Add button.

Pattern follows existing SettingCard: `pending` state, `optimisticResponse`, per-field saving. Each change calls `updateSettings` with the full updated array.

## Integration Points

None. The feature operates entirely within the existing monorepo boundaries.

## Impact Analysis

| Component                              | Impact Type | Description                                                        | Action                                    |
| -------------------------------------- | ----------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `UserSettingEntity`                    | Modified    | Two new JSONB columns                                              | Add migration                             |
| `UserSettingType`                      | Modified    | Two new GraphQL fields                                             | Add field declarations                    |
| `UpdateSettingsInput`                  | Modified    | Two new optional fields                                            | Add input declarations                    |
| `SettingsService`                      | None        | Existing `getSettings`/`updateSettings` handle JSONB transparently | No changes                                |
| `KeywordBlockerService`                | **New**     | Core blocking logic                                                | Create file, register provider            |
| `JobsService.create()`                 | Modified    | Call blocker after normalization, before duplicate                 | Inject `KeywordBlockerService`, add check |
| `JobsModule`                           | Modified    | Import `NotesModule`, register `KeywordBlockerService`             | Update imports and providers              |
| `NoteService`                          | Modified    | New `createPlainTextNote()` method                                 | Add method                                |
| `ApplicationQuickFilterEnum`           | Modified    | Add `REJECTED` value                                               | Add enum member                           |
| `JobsListQuery`                        | Modified    | Handle `REJECTED` filter                                           | Add case in `findAllByUserId()`           |
| `QuickFilters` UI                      | Modified    | New REJECTED chip (auto after codegen)                             | Run codegen                               |
| `SettingsTabPage`                      | Modified    | New "Blocked Keywords" section                                     | Add JSX                                   |
| `settings.graphql`                     | Modified    | Add `blockedKeywords` and `blockedCompanies` fields                | Add to query and input                    |
| `scripts/fix-seed-blocked-keywords.ts` | **New**     | Seed datafix from legacy SQLite                                    | Create script                             |
| `schema.gql`                           | Generated   | Updated via PM2 restart                                            | Run after API changes                     |

## Testing Approach

### Unit Tests

- `KeywordBlockerService`: test each scope with PARTIAL and EXACT match modes, case-insensitivity, blockedCompanies exact match, no-match returns null, empty list returns null.
- `jobs.service.ts`: test that blocker is called before duplicate detection; test that Note creation failure does not block job creation.
- `NoteService.createPlainTextNote`: test successful creation, test job-not-found error.

### Integration Tests

- Create job with blocked company name → stage is REJECTED, note is created with correct content.
- Create job with blocked keyword (TITLE scope, PARTIAL) → stage is REJECTED.
- Create job without any blocked keyword → stage is NEW (or DUPLICATED).
- Create job with blocked keyword, Note service fails → job is still REJECTED (no note).
- REJECTED quick filter returns only REJECTED-stage jobs.

### End-to-End (E2E)

- Add blocked company via settings UI, create job via API → verify REJECTED in list with REJECTED filter active.

## Development Sequencing

### Build Order

1. **Data model + migration** — Add `blocked_keywords` and `blocked_companies` JSONB columns to `user_settings`, create migration. Add GraphQL types (`BlockedKeywordType`, `KeywordScope`, `MatchMode` enums), update `UserSettingType` and `UpdateSettingsInput`. Run `pm2 restart api`.
   _Depends on:_ nothing.

2. **KeywordBlockerService** — Create service with `evaluate()` method. Register in `JobsModule` as provider.
   _Depends on:_ step 1.

3. **NoteService.createPlainTextNote** — Add method that creates a plain-text note without TipTap validation.
   _Depends on:_ nothing.

4. **JobsModule + JobsService blocking integration** — Import `NotesModule` in `JobsModule`. In `JobsService.create()`, call `KeywordBlockerService.evaluate()` after normalization and `resolveCompanyId()`. On match: set stage REJECTED, skip duplicate detection, create stage event with source SYSTEM, call `tryRun(noteService.createPlainTextNote(...))`.
   _Depends on:_ steps 2, 3.

5. **REJECTED quick filter** — Add `REJECTED` to `ApplicationQuickFilterEnum`. Add `REJECTED` case in `JobsListQuery.findAllByUserId()`. Run `pm2 restart api` → codegen.
   _Depends on:_ nothing (independent of blocking logic).

6. **Settings UI** — Add "Blocked Keywords" section to `SettingsTabPage`. Keyword list with badge + delete, add form, company tag input. Each mutation sends full arrays. Update `settings.graphql` query and mutation.
   _Depends on:_ step 1 (types exist in schema), step 5 (codegen).

7. **Seed datafix script** — Create `apps/api/scripts/fix-seed-blocked-keywords.ts` following existing `fix-*` patterns. Read from legacy SQLite, map types, upsert to user settings. Support `--dry-run`.
   _Depends on:_ step 1.

8. **Codegen** — `pm2 restart api` → `pnpm --filter @job-tracker/web run codegen`.
   _Depends on:_ steps 1, 5.

### Technical Dependencies

- Legacy SQLite database must be accessible for datafix script. Path: `/Users/richardaum/projects/linkedin/linkedin_jobs.db` (read-only).

## Monitoring and Observability

### Log Events

- `[KeywordBlocker] Blocked job <jobId> — keyword "<term>" matched in <scope>` — INFO.
- `[KeywordBlocker] Auto-note creation failed for job <jobId>: <error>` — WARN.

### Key Metrics

- Number of auto-blocked jobs per user (via stage event with source SYSTEM and toStage REJECTED).
- Number of keywords managed per user.

## Technical Considerations

### Key Decisions

| Decision                                    | Rationale                                                                           | Trade-off                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Block before duplicate (ADR-004)            | User blocking intent takes priority over duplicate classification                   | Wasted duplicate query avoided; duplicate metrics may undercount |
| Note via NotesModule import (ADR-005)       | Simpler than event pattern; reuses existing Note infrastructure                     | Adds module dependency; `tryRun` handles best-effort             |
| Full-replacement JSONB arrays               | Existing `updateSettings` pattern; no need for array-patch mutations                | Client must send full list on every change                       |
| Separate `blockedCompanies` field (ADR-001) | Company name blocking is a frequent standalone need; simpler UI than scope selector | Slightly more storage                                            |

### Known Risks

| Risk                                        | Likelihood | Mitigation                                                                                                                           |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Large keyword list slows creation           | Low        | Keyword list is bounded by JSONB size (practical limit: hundreds). Check is O(n) with string includes — fast for typical list sizes. |
| TipTap description JSON complicates blocker | Medium     | Parse description JSON to extract plain text before matching. Use existing TipTap utilities or a simple JSON text extractor.         |
| Note creation failure loses traceability    | Low        | `tryRun` catches error, logs warning. Job remains REJECTED.                                                                          |
| Legacy SQLite not available for datafix     | Low        | Script exits with clear error. User can add keywords manually via Settings UI.                                                       |

### Description Parsing for Blocker

The `description` field in `CreateJobInput` is a TipTap JSON string. Before matching keywords with scope `DESCRIPTION`, extract plain text. Use the existing TipTap helpers or a lightweight stripper:

```typescript
function extractPlainText(tipTapJson: string): string {
  try {
    const doc = JSON.parse(tipTapJson);
    // Walk the TipTap JSON tree, collect text nodes
    return extractTextNodes(doc).join(" ").toLowerCase();
  } catch {
    return tipTapJson.toLowerCase(); // fallback: treat as plain text
  }
}
```

## Architecture Decision Records

- [ADR-001: Structured Keyword Blocking with Per-Keyword Scope](adrs/adr-001.md) — Keywords stored as JSONB array with per-entry scope and match mode.
- [ADR-002: Block on Creation Only — Short-Circuit Stage Assignment](adrs/adr-002.md) — Blocking evaluated at creation time only, no retroactive re-evaluation.
- [ADR-003: Auto-generated Note on Block for Traceability](adrs/adr-003.md) — Auto-generated Note documents the matched keyword and scope.
- [ADR-004: Keyword Blocking Runs Before Duplicate Detection](adrs/adr-004.md) — Blocking evaluated before duplicate check; blocker match skips duplicate detection entirely.
- [ADR-005: Auto-Note Creation via NotesModule Import and Plain-Text Method](adrs/adr-005.md) — Import NotesModule into JobsModule; add `createPlainTextNote` method; wrap in `tryRun`.
- [ADR-006: Add REJECTED to ApplicationQuickFilter Enum](adrs/adr-006.md) — REJECTED quick filter added to API and frontend for blocked-job discoverability.
