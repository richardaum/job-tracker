# TechSpec: Wire Settings Automation (Auto-Fill + Auto-Summary Pattern)

**Feature slug:** `wire-settings-automation`  
**PRD:** [User Profile PRD](../user-profile/_prd.md) — follow-up for risk item _"Auto-fill and auto-summary toggles need backend wiring"_

## Executive Summary

Wire `autoFillEnabled` by adding `autoFill: Boolean` to `CreateJobInput` and gating server-side fill in `JobsService.create()` when both `autoFill` (per-action intent) and `autoFillEnabled` (user preference) are true. Remove the legacy `?autoConvert=true` frontend trigger entirely.

**Prerequisite refactor (complete — applied manually):** the jobs domain now uses three orchestrator services — `JobsService` (lifecycle), `JobAutomaticFillService` (automatic fill workflow + TX finalize), and `JobSummaryService` (summary workflow). CAS/stale-reset SQL lives on `JobsRepository` via `async-metadata.helper.ts`; `JobFillPersistence` and `JobAsyncMetadataRepository` were removed.

Auto-summary is already wired via `SummaryEventListener` → `JobSummaryService.requestSummary` with an `autoSummaryEnabled` gate. This spec documents the shared **Settings Automation Pattern** so both toggles behave consistently: automatic paths respect settings; explicit mutations do not.

**Primary trade-off:** Hard cutover of query-param fill removes URL bypass in exchange for coordinated web + extension release.

## System Architecture

### Component Overview

```
┌─────────────┐     createJob(autoFill)      ┌──────────────────┐
│ Web / Ext   │ ───────────────────────────► │ JobsService      │
│             │                              │ .create()        │
└─────────────┘                              │  (lifecycle)     │
       │                                     └────────┬─────────┘
       │ explicit mutation                            │ gate + delegate
       ▼                                              ▼
┌──────────────────┐                       ┌──────────────────────────┐
│ JobsResolver     │                       │ JobAutomaticFillService  │
│ fillJobAutomatically                      │ .fillJobAutomatically()  │
└──────────────────┘                       │ .processFillJob()        │
                                           └────────────┬─────────────┘
                                                        │
                                              FillJobRequested
                                                        ▼
                                           ┌──────────────────────────┐
                                           │ FillJobEventListener     │
                                           └──────────────────────────┘

JobUpdated ──► SummaryEventListener ──► autoSummaryEnabled gate ──► JobSummaryService.requestSummary
Manual requestJobSummary ──► JobSummaryService.requestSummary (no gate)

JobsRepository ── thin CRUD + CAS helpers (updateFillMetadataIfStatus, updateSummaryMetadataIfStatus, resetStale*)
```

| Component                      | Responsibility                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `SettingsService`              | Source of truth for `autoFillEnabled`, `autoSummaryEnabled`                                           |
| `JobsService`                  | Lifecycle orchestrator: CRUD, stage events, create gate delegates fill start                          |
| `JobAutomaticFillService`      | Automatic fill: start (`fillJobAutomatically`), worker (`processFillJob`), TX finalize, fill metadata |
| `JobSummaryService`            | Summary: `requestSummary`, `doGenerate`, summary metadata                                             |
| `JobsRepository`               | Thin CRUD on `JobEntity` + conditional JSONB metadata updates                                         |
| `async-metadata.helper.ts`     | Shared CAS / stale-reset SQL used by `JobsRepository`                                                 |
| `FillJobEventListener`         | Delegates `FillJobRequested` → `JobAutomaticFillService.processFillJob`                               |
| `SummaryEventListener`         | Auto path gated on `autoSummaryEnabled`; delegates to `JobSummaryService`                             |
| `PasteDestinationDialog`       | Per-import `autoFill` checkbox; default from settings                                                 |
| `ImportJobService` (extension) | Pass `autoFill: true`; navigate without query param                                                   |

### Completed Refactor (manual)

| Removed                                                           | Replaced by                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `JobFillPersistence` / `job-fill.persistence.ts`                  | TX finalize inside `JobAutomaticFillService`                   |
| `JobAsyncMetadataRepository` / `job-async-metadata.repository.ts` | `JobsRepository` metadata methods + `async-metadata.helper.ts` |
| `SummaryService` / `summary.service.ts`                           | `JobSummaryService` / `job-summary.service.ts`                 |

## Implementation Design

### Core Interfaces

```ts
// apps/api/src/domains/jobs/create-job.input.ts
@Field(() => Boolean, { nullable: true })
autoFill?: boolean | null;

// apps/api/src/domains/jobs/jobs.service.ts (draft-capture branch, after persistence)
if (dto.autoFill === true) {
  const settings = await this.settings.getSettings(userId);
  if (settings.autoFillEnabled) {
    this.logger.log(`[AutoFill] Queued fill for job ${job.id}`);
    await this.fillService.fillJobAutomatically(userId, job.id);
  } else {
    this.logger.debug(`[AutoFill] Skipped job ${job.id}: autoFillEnabled=false`);
  }
}
return this.findOne(job.id, userId);

// JobAutomaticFillService (existing — no gate on mutation path)
async fillJobAutomatically(userId: string, jobId: string): Promise<JobWithCurrentStage>;
async processFillJob(userId: string, jobId: string): Promise<void>;

// JobSummaryService (existing — reference for auto-summary)
async requestSummary(jobId: string, userId: string): Promise<void>;
async doGenerate(jobId: string, userId: string): Promise<void>;
```

**Circular dependency note:** `JobAutomaticFillService` already injects `JobsService`. Inject `JobAutomaticFillService` into `JobsService` via Nest `forwardRef` for the create gate only.

**Settings Automation Pattern (contract):**

| Trigger                       | Checks setting?            | Entry point                                                                    |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| Draft create + `autoFill`     | Yes (`autoFillEnabled`)    | `JobsService.create()` → `JobAutomaticFillService.fillJobAutomatically`        |
| Job field/note/stage update   | Yes (`autoSummaryEnabled`) | `SummaryEventListener.handleJobUpdated()` → `JobSummaryService.requestSummary` |
| User clicks Fill / Regenerate | No                         | `fillJobAutomatically` / `requestJobSummary` mutations                         |

### Data Models

No schema migration. Existing `user_settings.auto_fill_enabled` column is used.

**GraphQL input change:**

```graphql
input CreateJobInput {
  # ... existing fields ...
  autoFill: Boolean # per-action intent; only meaningful with createAsDraftCapture
}
```

### API Endpoints

| Operation                       | Change                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `mutation createJob(input)`     | Accept optional `autoFill`; may return job with `fillMetadata.status = PROCESSING` |
| `mutation fillJobAutomatically` | Unchanged; never gated by setting                                                  |
| `mutation requestJobSummary`    | Unchanged; never gated by setting                                                  |
| `query settings`                | Unchanged; web uses for paste checkbox default                                     |

## Integration Points

| Client               | Change                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Web paste**        | Pass `autoFill` from checkbox; default from `useSettingsQuery`; navigate to `/jobs/{id}` |
| **Extension import** | Pass `autoFill: true` in `createDraftCaptureJob`; open `/jobs/{id}` without query param  |
| **Job detail page**  | Remove `useJobAutoFillFromQuery`; manual button unchanged                                |

## Impact Analysis

| Component                    | Impact      | Risk   | Action                                                           |
| ---------------------------- | ----------- | ------ | ---------------------------------------------------------------- |
| `jobs.service.ts`            | Modified    | Medium | Inject `JobAutomaticFillService`; auto-fill gate on draft create |
| `jobs.service.spec.ts`       | Modified    | Medium | Gate matrix tests with mocked fill service                       |
| `create-job.input.ts`        | Modified    | Low    | Add `autoFill` field                                             |
| `useJobAutoFillFromQuery.ts` | Deprecated  | Low    | Delete file                                                      |
| `JobDetailsLayout.tsx`       | Modified    | Low    | Remove hook                                                      |
| `PasteListenerProvider.tsx`  | Modified    | Low    | Pass `autoFill`, drop query param                                |
| `PasteDestinationDialog.tsx` | Modified    | Low    | Default checkbox from settings                                   |
| `import-job.service.ts`      | Modified    | Low    | Pass `autoFill: true`                                            |
| `draft-conversion.spec.ts`   | Modified    | Medium | Assert server-side fill                                          |
| `summary-event.listener.ts`  | Done        | None   | Reference pattern (already gated)                                |
| `schema.gql`                 | Regenerated | Low    | PM2 restart + codegen                                            |
| `docs/FEATURE_MAP.md`        | Modified    | Low    | Update auto-convert description                                  |

## Testing Approach

### Unit Tests

**API — refactor (complete)**

- `job-automatic-fill.service.spec.ts` and `jobs-fill.integration.ts` cover fill workflow + TX finalize.
- `jobs.resolver.spec.ts` verifies resolver delegates to `JobAutomaticFillService` / `JobSummaryService`.

**API — auto-fill gate (task 02)**

| Scenario                                   | Expected                      |
| ------------------------------------------ | ----------------------------- |
| `autoFill: true`, `autoFillEnabled: true`  | `fillJobAutomatically` called |
| `autoFill: true`, `autoFillEnabled: false` | Fill not called               |
| `autoFill: false`, `autoFillEnabled: true` | Fill not called               |
| `autoFill: undefined`                      | Fill not called               |
| Non-draft create with `autoFill: true`     | Fill not called (ignore flag) |

**Web — `PasteDestinationDialog.test.tsx`**

- Checkbox defaults to `autoFillEnabled` from mocked settings.

### E2E

- Update `draft-conversion.spec.ts`: paste with checkbox checked + setting on → fill processing without `?autoConvert`.

## Development Sequencing

### Build Order

0. **Jobs domain refactor** — ✅ **Complete (manual).** Three orchestrators; metadata on `JobsRepository`.
1. **GraphQL input + auto-fill service gate** — add `autoFill` to `CreateJobInput`; implement gate in `JobsService.create()` draft branch; unit tests. _Depends on 0._
2. **PM2 restart + codegen** — regenerate `schema.gql`, web/extension GraphQL types. _Depends on 1._
3. **Web client updates** — paste dialog default + `autoFill` on mutation; remove `useJobAutoFillFromQuery`. _Depends on 2._
4. **Extension update** — pass `autoFill: true`; remove query param. _Depends on 2._
5. **E2E + docs** — update tests and `FEATURE_MAP.md`. _Depends on 3, 4._

### Technical Dependencies

- API running for schema regeneration (`pnpm pm2:restart api` or equivalent).
- `pnpm --filter @job-tracker/web run codegen` after schema change.
- Extension codegen if separate from web.

## Monitoring and Observability

- **Log (debug):** `[AutoFill] Skipped job {id}: autoFillEnabled=false` when intent true but setting off.
- **Log (info):** `[AutoFill] Queued fill for job {id}` when gated fill starts.

## Technical Considerations

### Key Decisions

See ADRs 001–004. Prerequisite refactor (ADR-004) is complete.

### Known Risks

| Risk                                                   | Mitigation                                            |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Circular dep `JobsService` ↔ `JobAutomaticFillService` | `forwardRef` on both sides                            |
| Stale extension without `autoFill`                     | Monorepo release; note in changelog                   |
| User expects fill with setting off + checkbox on       | Both must allow; document in Settings tab description |

## Architecture Decision Records

- [ADR-001: Backend Hybrid Auto-Fill Trigger](adrs/adr-001.md) — `autoFill` input + server-side `autoFillEnabled` gate on draft create
- [ADR-002: Hard Cutover — Remove `?autoConvert=true`](adrs/adr-002.md) — delete query-param trigger in same release
- [ADR-003: Shared Settings Automation Pattern](adrs/adr-003.md) — automatic paths gated; explicit mutations bypass settings
- [ADR-004: Three Orchestrator Services](adrs/adr-004.md) — `JobsService`, `JobAutomaticFillService`, `JobSummaryService`; metadata on `JobsRepository`
