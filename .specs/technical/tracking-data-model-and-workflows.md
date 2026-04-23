# Technical Scope: tracking-data-model-and-workflows

## Architecture Impact

- [T-57] Extend application domain schema with normalized stage enum, append-only transition events, and a `notes` model keyed to exactly one target (`application_id` XOR `stage_event_id`) with TipTap JSON content.
- [T-58] Add GraphQL mutations and queries for stage transition plus note create/update/list flows that validate TipTap payloads and support multiple notes per stage event.
- [T-110] Treat `applications.description` as TipTap document JSON at API boundaries (create/update/read) with validation parity to note content rules.

## Design Decisions

- [T-59] Persist stage transitions as append-only events and derive current stage snapshots from the latest valid status event.
- [T-60] Keep notes revision-aware with explicit client-provided revision tokens to avoid silent overwrite during concurrent edits.
- [T-93] Allow transitions between any defined stage statuses and validate only ownership, enum validity, and event-write consistency.
- [T-94] Expose timeline entries as a single ordered stream combining stage events and note events so the UI can render one canonical activity history.
- [T-95] Include actor metadata, source context, and timestamps in transition and note events to support auditability and downstream analytics.
- [T-106] On application creation, write an initial stage event with `toStage=NEW` so every record has a canonical starting state.
- [T-99] Execute delivery in ordered slices: data model and migrations, API contracts, web timeline UX, revision safety, then end-to-end hardening.
- [T-100] Gate each slice with explicit verification before advancing so partial implementation cannot be marked complete without passing tests.
- [T-108] Use two dropdown interaction surfaces: a `status change` dropdown (with optional stage-note creation tied to emitted event id) and a dedicated application-note dropdown.

## Risks and Mitigations

- [T-61] Stage-state drift between event log and current snapshot -> derive current stage from canonical event ordering with consistency checks.
- [T-62] Note mutation race conditions -> enforce optimistic locking or revision checks at write time.
- [T-96] Timeline pagination inconsistency with concurrent writes -> use stable cursor semantics based on created-at and event id tie-breakers.
- [T-97] Increased write amplification from event + snapshot updates -> wrap writes in transactional boundaries and monitor mutation latency.

## Validation

- [T-63] Verify free-status transitions, ownership boundaries, and enum validation through API integration tests.
- [T-64] Verify timeline ordering, cursor pagination stability, and note revision conflict behavior through unit and end-to-end coverage.
- [T-98] Verify current stage snapshots reconcile with transition event history under seeded migration and runtime mutation scenarios.
- [T-101] Slice 1 validation: confirm schema migration creates stage-event and note revision fields with backward-compatible defaults.
- [T-102] Slice 2 validation: confirm GraphQL mutations and queries enforce ownership and return canonical timeline payloads.
- [T-103] Slice 3 validation: confirm web UI supports free-status changes, timeline rendering, and note editing with revision tokens.
- [T-104] Slice 4 validation: confirm conflict handling and timeline pagination remain deterministic under concurrent write simulations.
- [T-105] Slice 5 validation: run lint, typecheck, unit/integration, and e2e gates for tracking scope before closing [R-16].
- [T-107] Verify application creation always emits one initial `NEW` stage event and that timeline queries include it as the first entry.
- [T-109] Verify tracking UX submits status changes through `createApplicationStageEvent`, writes notes through `createApplicationNote`/`updateApplicationNote`, and rejects non-TipTap payloads at API validation.
- [T-111] Verify application create/update rejects non-TipTap `description` payloads while preserving null/empty description behavior.
