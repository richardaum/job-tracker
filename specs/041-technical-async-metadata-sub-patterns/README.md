---
status: in-progress
created: 2026-05-16
priority: high
tags:
  - api
  - async
  - architecture
  - pattern
  - graphql
---

# Technical Scope: async-metadata-sub-patterns

> **Status**: active · **Priority**: high · **Created**: 2026-05-16

## Summary

Spec 034 defines a unified `AsyncMetadata` JSONB pattern for async jobs. This spec distinguishes two sub-patterns that share the same shape (`{ status, error, timestamp }`) but differ in where the metadata lives:

| Sub-pattern     | Where                                                                                      | Examples                                                     |
| --------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **AsyncField**  | Inline JSONB on an existing entity. Entity exists independently. `null` = never requested. | `Job.summaryMetadata`, `DraftApplication.conversionMetadata` |
| **AsyncEntity** | JSONB on an entity that **is** the async result. Entity lifecycle = job lifecycle.         | `MatchAnalysis.generationMetadata`                           |

The metadata shape is the same for both because `updatedAt` on the entity row is not a reliable job completion timestamp — only an explicit field in the metadata is.

## Target State

```graphql
type JobType {
  summaryMetadata: AsyncMetadata # { status, error, timestamp }
}

type MatchAnalysisType {
  metadata: AsyncMetadata! # { status, error, timestamp }
  items: [MatchItem!]!
  scoreRatio: Float
}

type DraftApplicationType {
  conversionMetadata: AsyncMetadata! # { status, error, timestamp }
}
```

**Deltas:**

- `generatedAt` → `timestamp`
- `MatchAnalysisStatus` enum removed → uses `AsyncMetadataStatus`
- `MatchAnalysis.status` + `.error` → `MatchAnalysis.metadata`
- `DraftApplication.conversionStatus` + `.conversionError` + `.convertedAt` → `.conversionMetadata`

## Changes

### Phase 1 — Rename `generatedAt` → `timestamp`

No breaking change. Same type, renamed field.

- [T-277] Rename in `AsyncMetadata` interface + `AsyncMetadataType` GraphQL type + `schema.gql`
- [T-278] Update `summary.service.ts`, `job.events.ts`, `jobs.repository.ts`
- [T-279] Regenerate codegen

### Phase 2 — Migrate `MatchAnalysis` to JSONB metadata

Breaking: `fit.status` → `fit.metadata.status`. Eliminates duplicate enum `MatchAnalysisStatus`.

- [T-280] Remove `MatchAnalysisStatus` enum; use `AsyncMetadataStatusEnum`
- [T-281] DB: `status` + `error` columns → `generation_metadata` jsonb. Migration with backfill.
- [T-282] `match-analysis.type.ts`: `@Field(() => AsyncMetadataType) metadata`
- [T-283] `match-analysis.service.ts`: rewrite status/error access to `generationMetadata.*`
- [T-284] `match-analysis.repository.ts`: queries on `generation_metadata->>'status'`
- [T-285] Update all `*.spec.ts` referencing `MatchAnalysisStatus` or old columns
- [T-286] Remove `enum MatchAnalysisStatus` from `schema.gql`
- [T-287] Regenerate codegen

### Phase 3 — Migrate `DraftApplication` to JSONB metadata (future, breaking)

- [T-288] Consolidate `conversion_status` + `conversion_error` + `converted_at` → `conversion_metadata` jsonb
- [T-289] `convertedAt` → `conversionMetadata.timestamp`
- [T-290] Enum `DraftApplicationConversionStatusEnum` stays (has `IDLE`, `SUCCEEDED` — different state machine)

## Enum Unification

- `MatchAnalysisStatus` = duplicate of `AsyncMetadataStatus` → removed in Phase 2
- `DraftApplicationConversionStatusEnum` stays — different state machine (`IDLE`/`SUCCEEDED` ≠ `COMPLETED`)
- `SourceRunStatusEnum` — business process, not async data generation. Out of scope.

## Modus Operandi

All patterns from spec 034 apply. Completion is **event-driven** (EventBus → SSE):

1. Mutation sets `PROCESSING`, returns immediately
2. Background completes → atomic jsonb update → emit event → SSE pushes to clients
3. `tryRun()`, stale recovery (`onModuleInit`), atomic CAS (`jsonb ||`)

## Risks

- [T-291] Phase 2 breaks `fit.status` / `fit.error` in GraphQL. Mitigation: single commit with codegen regen.
- [T-292] Phase 3 breaks `DraftApplicationType` fields. Deferred.

## Validation

- [T-293] `pnpm lint && pnpm typecheck` pass
- [T-294] `pnpm test` passes
- [T-295] `schema.gql` regenerated and correct
- [T-296] `pnpm leanspec:validate && pnpm leanspec:sync-spec-indices` pass
